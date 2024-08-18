import DashboardWrapper from "@/app/_components/dashboard/Wrapper";
import RootAcceptedChallenge from "../../_components/dashboard/RootAcceptedChallenge";
import UserInfo from "../../_components/dashboard/UserInfo";

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <main className="space-y-4 px-6 py-10 md:px-6">
        <UserInfo />
        <RootAcceptedChallenge />
      </main>
    </DashboardWrapper>
  );
};

export default Dashboard;
