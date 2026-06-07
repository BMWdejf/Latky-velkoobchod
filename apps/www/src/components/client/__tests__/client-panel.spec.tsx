import { render, screen } from "@testing-library/react";
import { ClientDashboard } from "@/components/client/client-dashboard";
import { PendingApproval } from "@/components/client/pending-approval";

// react-toastify is exercised via PendingApproval's mount effect; stub it out.
jest.mock("react-toastify", () => ({ toast: { info: jest.fn() } }));

describe("PendingApproval (customer role)", () => {
  it("shows the pending-approval notice and no business data", () => {
    render(<PendingApproval />);
    expect(screen.getByText("Účet čeká na schválení")).toBeInTheDocument();
    expect(screen.queryByText("Faktury")).not.toBeInTheDocument();
    expect(screen.queryByText("Objednávky")).not.toBeInTheDocument();
  });
});

describe("ClientDashboard (client role)", () => {
  it("shows orders, invoices and prices sections", () => {
    render(<ClientDashboard name="Jan" />);
    expect(screen.getByText("Objednávky")).toBeInTheDocument();
    expect(screen.getByText("Faktury")).toBeInTheDocument();
    expect(screen.getByText("Ceny")).toBeInTheDocument();
    expect(screen.getByText(/Vítejte, Jan/)).toBeInTheDocument();
  });
});
