import DashboardWrapper from "@/app/_components/dashboard/Wrapper";
import UserInfo from "../../_components/dashboard/UserInfo";
import Challenges from "../../_components/challenge/Challenges";

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <main className="space-y-4 px-6 py-10 md:px-6">
        <UserInfo />
        <Challenges />
      </main>
    </DashboardWrapper>
  );
};

export default Dashboard;
