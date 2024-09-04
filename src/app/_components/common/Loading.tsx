const Loading = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-white">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-gray-100"></div>
        <p className="mt-4 text-xl font-semibold">Loading challenge...</p>
      </div>
    </div>
  );
};

export default Loading;
