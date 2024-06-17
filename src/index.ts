import net from "net";
import Parser from "redis-parser";

const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const parser = new Parser({
      returnReply: (reply) => {
        console.log("=> ", reply);
      },
      returnError(err) {
        console.log("=> ", err);
      },
    });

    parser.execute(data);
    connection.write("+OK\r\n");
  });
});

server.listen(6969, () => console.log("YourDiss Running On PORT 6969!"));
