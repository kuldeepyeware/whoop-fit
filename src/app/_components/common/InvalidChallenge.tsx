import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";

const InvalidChallenge = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-none bg-white/10 text-white shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Invalid Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          The challenge you are trying to view is not valid
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <p className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600">
              Back to Home
            </p>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvalidChallenge;
