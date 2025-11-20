import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobileNumber: { label: "Mobile Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.mobileNumber || !credentials?.otp) {
          return null;
        }

        try {
          await connectDB();

          // Verify OTP (hardcoded for now)
          const HARDCODED_OTP = "123456";
          if (credentials.otp !== HARDCODED_OTP) {
            return null;
          }

          // Find user by mobile number
          const user = await User.findOne({ mobileNumber: credentials.mobileNumber });

          if (!user) {
            return null;
          }

          return {
            id: user._id.toString(),
            mobileNumber: user.mobileNumber,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobileNumber = user.mobileNumber;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.mobileNumber = token.mobileNumber as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

