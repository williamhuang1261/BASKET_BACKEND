import winston from "winston";
import "express-async-errors";

const logging = () => {
  winston.exceptions.handle(
    new winston.transports.Console({ 
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
        winston.format.prettyPrint()
      )
    }),
    new winston.transports.File({ filename: "log/uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex: NodeJS.UnhandledRejectionListener) => {
    throw ex;
  });

  winston.add(
    new winston.transports.File({
      filename: "log/logfile.log",
      level: "warn",
    })
  );
  winston.add(new winston.transports.Console());
};

export default logging;
