import { createTransport } from "nodemailer";
import { SessionConfig } from "../..";

const Email = (
  isEnabled: boolean,
  options: NonNullable<SessionConfig["emailing"]> | undefined,
) => {
  if (!isEnabled || !options) return () => undefined;

  const transporter = createTransport({
    host: options.host,
    auth: {
      user: options.user,
      pass: options.password,
    },
    port: options.port,
    // pool: true,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  logger: true,
  debug: true,
  });

  // transporter.verify((error) => {
  //   if (!error) return;

  //   console.log("ERROR")
  // });

  return async (subject: string, text: string) => {
    try {
      const fuckme = await transporter.sendMail({
        from: options.user,
        to: options.receiverEmail,
        subject,
        text,
      })

      console.log("hi", fuckme)
    } catch (error) {
      console.log({error})
    }

    // , (error, info) => {
    //   console.log("error", error)
    //   console.log("info", info)
    // });

  };
};

export default Email;
