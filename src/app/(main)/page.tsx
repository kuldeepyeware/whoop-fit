import AcceptedSelfChallenge from "../_components/rootPage/ActiveSelfChallenge";
import RootAcceptedChallenge from "../_components/rootPage/RootAcceptedChallenge";
import UserInfo from "../_components/rootPage/UserInfo";

const RootPage = () => {
  return (
    <main className="space-y-4 px-6 py-10 md:px-6">
      <UserInfo />
      <RootAcceptedChallenge />
      <AcceptedSelfChallenge />
    </main>
  );
};

export default RootPage;
