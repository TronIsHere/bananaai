import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mobileNumber: string;
      firstName: string;
      lastName: string;
    };
  }

  interface User {
    id: string;
    mobileNumber: string;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mobileNumber: string;
    firstName: string;
    lastName: string;
  }
}

