import { useEffect } from "react";
import { useGetEmployeeMutation } from "../features/ApplicationApi";

const SalarySlip = () => {
  const [getEmployee, { data, isLoading, error }] = useGetEmployeeMutation();

  useEffect(() => {
    getEmployee();
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;

  const loggedInEmail = localStorage.getItem("email");
  console.log("API data:", data);
  console.log("loggedInEmail:", loggedInEmail);
  const employeesData = Array.isArray(data)
    ? data
    : data?.employees || data?.data || [];
  console.log("employee emails in DB:", employeesData.map(e => e.email));
  const employee = employeesData.find((e) => e.email?.trim().toLowerCase() === loggedInEmail?.trim().toLowerCase());
  console.log("matched employee:", employee);

  if (!employee) return <p>Employee not found.</p>;

  const salary = Number(employee.salary);
  const EPF = salary * 0.12;
  const ESI = salary * 0.0075;
  const PT = salary * 0.0025;
  const totalDeduction = EPF + ESI + PT;
  const grossSalary = salary - totalDeduction;
  const netSalary = grossSalary - totalDeduction;

  return (
    <div className="pt-16 min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Salary Slip</h2>
        <p>
          <strong>Employee:</strong> {employee.name}
        </p>
        <p>
          <strong>Email:</strong> {employee.email}
        </p>
        <p>
          <strong>Position:</strong> {employee.position}
        </p>
        <p>
          <strong>Basic Salary:</strong> ₹{salary.toFixed(2)}
        </p>
        <hr className="my-4" />
        <h3 className="font-semibold text-gray-700 mb-2">Deductions</h3>
        <p>EPF (12%): ₹{EPF.toFixed(2)}</p>
        <p>ESI (0.75%): ₹{ESI.toFixed(2)}</p>
        <p>PT (0.25%): ₹{PT.toFixed(2)}</p>
        <hr className="my-4" />
        <p>
          <strong>Total Deduction:</strong> ₹{totalDeduction.toFixed(2)}
        </p>
        <p>
          <strong>Gross Salary:</strong> ₹{grossSalary.toFixed(2)}
        </p>
        <p>
          <strong>Net Salary:</strong> ₹{netSalary.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default SalarySlip;
