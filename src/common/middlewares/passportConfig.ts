import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from "passport";
import { prisma } from "../utils/db";
import { generateAccessToken, generateRefreshToken } from "../utils/auth";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'jwt_secret'
};

// JWT strategy
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

// Google OAUTH Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails?.[0].value }
                });

                if(!user) {
                    const userObj = {
                        email: profile.emails?.[0].value as string,
                        firstName: profile.name?.givenName,
                        lastName: profile.name?.familyName
                    }

                    return done(null, { userObj });
                }

                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);

                return done(null, { user, accessToken, refreshToken });
            }
            catch(error) {
                return done(error, null as any)
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj as Express.User);
});

export default passport;
