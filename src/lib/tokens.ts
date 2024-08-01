import { v4 as uuidv4 } from "uuid";
import { db } from "../server/db";
import { getVerificationTokenByEmail } from "../data/verificationToken";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    try {
      await db.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    } catch (error) {
      return null;
    }
  }

  try {
    const verificationToken = await db.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return verificationToken;
  } catch (error) {
    return null;
  }
};

// export const generatePasswordResetToken = async (email: string) => {
//   const token = uuidv4();
//   const expires = new Date(new Date().getTime() + 3600 * 1000);

//   const existingToken = await getPasswordTokenByEmail(email);

//   if (existingToken) {
//     try {
//       await db.passwordResetToken.delete({
//         where: {
//           id: existingToken.id,
//         },
//       });
//     } catch (error) {
//       return null;
//     }
//   }

//   try {
//     const passwordResetToken = await db.passwordResetToken.create({
//       data: {
//         email,
//         token,
//         expires,
//       },
//     });
//     return passwordResetToken;
//   } catch (error) {
//     return null;
//   }
// };
