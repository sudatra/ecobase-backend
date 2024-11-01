import { env } from "@/common/utils/env.config";
import { app, logger } from "@/server";
import { connectToDatabase, disconnectFromDatabase } from "./common/utils/db";

const bootstrap = async () => {
    await connectToDatabase();
    const server = app.listen(env.PORT, () => {
        const { NODE_ENV, HOST, PORT } = env;
        logger.info(`Server ${NODE_ENV} running on port http://${HOST}:${PORT}`);
    })

    const onCloseSignal = async () => {
        logger.info("sigint received, shutting down");

        server.close(async () => {
            logger.info("server closed");
            await disconnectFromDatabase();
            logger.info("prisma client disconnected");
            process.exit();
        });

        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
}

bootstrap().catch((error) => {
    console.log(error)
    logger.error("Failed to start the server", error);
    process.exit();
});