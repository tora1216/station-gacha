import Header from "./_components/Header";
import Gacha from "./_components/Gacha";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            関東の路線・駅をランダムに選んで、散歩の行き先を決めよう
          </p>
          <Gacha />
        </div>
      </main>
    </div>
  );
}
