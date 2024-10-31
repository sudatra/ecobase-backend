import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { prisma } from "../../utils/db";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'jwt_secret'
};

passport.use(
    new JWTStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.userId }
            });

            if(user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        }
        catch(error) {
            return done(error, false)
        }
    })
);

export default passport;
