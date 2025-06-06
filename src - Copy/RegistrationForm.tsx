export function RegistrationForm() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Welcome!</h2>
      <form className="mt-4 flex flex-col gap-2">
        <input className="border p-2 rounded" placeholder="Enter your name" />
        <input className="border p-2 rounded" placeholder="Enter your age" />
        <input className="border p-2 rounded" placeholder="Enter your grade" />
        <input className="border p-2 rounded" placeholder="Enter language" />
        <button className="bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
