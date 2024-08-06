import AcceptedChallenge from "../_components/challenge/AcceptedChallenge";
import AcceptedSelfChallenge from "../_components/rootPage/ActiveSelfChallenge";
import UserInfo from "../_components/rootPage/UserInfo";

const RootPage = () => {
  return (
    <main className="space-y-4 px-6 py-10 md:px-6">
      <UserInfo />
      <AcceptedChallenge />
      <AcceptedSelfChallenge />
    </main>
  );
};

export default RootPage;
