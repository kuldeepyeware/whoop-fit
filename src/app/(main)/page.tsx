import ActiveChallenge from "../_components/rootPage/ActiveChallenge";
import ActiveSelfChallenge from "../_components/rootPage/ActiveSelfChallenge";
import UserInfo from "../_components/rootPage/UserInfo";

const RootPage = () => {
  return (
    <main className="space-y-10 px-4 py-10 md:px-6">
      <UserInfo />
      <ActiveChallenge />
      <ActiveSelfChallenge />
    </main>
  );
};

export default RootPage;
