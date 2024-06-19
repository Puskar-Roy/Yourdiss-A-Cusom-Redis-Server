import net from "net";
import Parser from "redis-parser";
import fs from "fs";

class Mydiss {
  private store: { [key: string]: string } = {};
  private server: net.Server;
  private filePath: string = "store.json";

  constructor(private port: number = 6969) {
    this.server = this.createServer();
    this.loadStore();
  }

  private saveStore() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.store));
  }

  private loadStore() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, "utf8");
      this.store = JSON.parse(data);
    }
  }

  private createServer(): net.Server {
    return net.createServer((connection) => {
      connection.on("data", (data) => {
        const parser = new Parser({
          returnReply: (reply) => {
            console.log("=> ", reply);
            const command = reply[0].toLowerCase();
            switch (command) {
              case "set":
                {
                  const key: string = reply[1];
                  const value: string = reply[2];
                  this.store[key] = value;
                  this.saveStore();
                  connection.write("+OK\r\n");
                }
                break;
              case "get":
                {
                  const key: string = reply[1];
                  const value: string = this.store[key];
                  if (!value) {
                    connection.write("$-1\r\n");
                  } else {
                    connection.write(`$${value.length}\r\n${value}\r\n`);
                  }
                }
                break;
              default:
                {
                  connection.write("-ERR unknown command\r\n");
                }
                break;
            }
          },
          returnError(err) {
            console.log("=> ", err);
            connection.write("-ERR internal error\r\n");
          },
        });

        parser.execute(data);
      });

      connection.on("error", (err) => {
        console.error("Client Disconnected!");
      });
    });
  }

  public start() {
    this.server.listen(this.port, () =>
      console.log(`Server running on port ${this.port}`)
    );
  }
}

export default Mydiss;
