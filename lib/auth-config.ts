import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { verifyOTP, normalizePhoneNumber } from "@/lib/otp-service";

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

          // Verify OTP (delete on success since this is the final authentication step)
          const verificationResult = await verifyOTP(
            credentials.mobileNumber,
            credentials.otp,
            true // Delete OTP after successful verification
          );

          if (!verificationResult.valid) {
            console.error("OTP verification failed:", verificationResult.error);
            return null;
          }

          // Normalize mobile number
          const normalizedMobileNumber = normalizePhoneNumber(
            credentials.mobileNumber
          );

          // Find user by mobile number
          const user = await User.findOne({
            mobileNumber: normalizedMobileNumber,
          });

          if (!user) {
            console.error(`User not found for mobile number: ${normalizedMobileNumber}`);
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
