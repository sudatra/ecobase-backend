import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from "passport";
import { prisma } from "../utils/db";
import { generateToken } from "../utils/auth";

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

// // Google OAUTH Strategy
// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//             callbackURL: '/api/auth/google/callback',
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let user = await prisma.user.findUnique({
//                     where: { email: profile.emails?.[0].value }
//                 });

//                 if(!user) {
//                     user = await prisma.user.create({
//                         data: {
//                             email: profile.emails?.[0].value,
//                             firstName: profile.name?.givenName,
//                             lastName: profile.name?.familyName
//                         }
//                     });
//                 }

//                 const token = generateToken(user);
//                 return done(null, { user, token });
//             }
//             catch(error) {
//                 return done(error, null)
//             }
//         }
//     )
// );

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj as Express.User);
});

export default passport;