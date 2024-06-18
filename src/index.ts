import net from "net";
import Parser from "redis-parser";

const store: { [key: string]: string } = {};

const server = net.createServer((connection) => {
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
              store[key] = value;
              connection.write("+OK\r\n");
            }
            break;
          case "get":
            {
              const key: string = reply[1];
              const value: string = store[key];
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
    console.error("Client Disconnectend!");
  });
});


server.listen(6969, () => console.log("YourDiss Running On PORT 6969!"));
