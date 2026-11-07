import { ConnectionForm } from "@/features/connections/components/connection-form/connection-form";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-600">This is your dashboard where you can manage your settings and view your data.</p>
      <ConnectionForm />
    </div>
  );
}
