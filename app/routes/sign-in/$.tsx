import { SignIn } from "@clerk/remix";

const Page = () => {
  return <div className="flex min-h-full justify-center items-center">
    <SignIn routing="path" path="/sign-in" />
  </div>;
};

export default Page;
