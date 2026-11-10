import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StandardForm } from "@/components/StandardForm";
import { BOOKING_TERMS_VERSION } from "@/lib/bookingTerms";
import { createReservaVoucherInDb, issueReservaVouchers } from "@/lib/db";

vi.mock("@/lib/db", () => ({createReservaInDb:vi.fn().mockResolvedValue("reservation-id"),createReservaVoucherInDb:vi.fn().mockResolvedValue("reservation-id"),issueReservaVouchers:vi.fn().mockResolvedValue({message:"Mensagem original com voucher"}),saveVoucherMessageInDb:vi.fn(),markCouponUsedInDb:vi.fn(),syncLead:vi.fn()}));
vi.mock("@/lib/cmsCache", () => ({getCmsTourPriceStatus:()=>"ready",getCachedTour:()=>({preco:70}),getCachedConfig:()=>undefined,isCmsConfigReady:()=>true,subscribeCmsCache:()=>()=>{},forceRefreshCms:{tours:vi.fn()}}));
vi.mock("@/lib/bookingDraft", () => ({bookingDraftKey:()=>"test",BOOKING_DRAFT_TTL_MS:600000,clearBookingDraft:vi.fn(),saveBookingDraft:()=>false,readBookingDraft:()=>({name:"Ana Costa",phone:{ddi:"+55",number:"22998001234"},pax:"2",date:"2026-11-15",hasKids:"no",payment:"pix"}),dateFromLocalKey:()=>new Date(2026,10,15)}));
vi.mock("@/components/PromoBanner",()=>({PromoBanner:()=>null}));
vi.mock("@/components/QrPromo",()=>({QrPromoBoot:()=>null}));
vi.mock("@/components/PageShell",()=>({PageShell:({children}:{children:React.ReactNode})=><div>{children}</div>}));
vi.mock("@/components/SummaryOutput",()=>({SummaryOutput:({text}:{text:string})=><div data-testid="summary">{text}</div>}));
vi.mock("@/components/TourDatePicker",()=>({TourDatePicker:()=>null}));
vi.mock("@/components/PhoneInput",()=>({PhoneInput:()=>null,fullPhone:(p:{ddi:string;number:string})=>`${p.ddi}${p.number}`}));

const form = <StandardForm lang="pt" onLangChange={vi.fn()} onBack={vi.fn()} title="Escuna" titlePt="Passeio de Escuna" tourKey="escuna" backgroundImage="" />;
describe("booking terms integration",()=>{
  beforeEach(()=>{vi.clearAllMocks();localStorage.clear();});
  it("does not create a reservation without explicit acceptance",async()=>{
    render(form);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    fireEvent.click(screen.getByRole("button",{name:/gerar|reserva/i}));
    expect(createReservaVoucherInDb).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid","true");
  });
  it("stores metadata separately and preserves voucher message",async()=>{
    render(form);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button",{name:/gerar|reserva/i}));
    await waitFor(()=>expect(createReservaVoucherInDb).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createReservaVoucherInDb).mock.calls[0][0].terms_acceptance).toMatchObject({accepted:true,version:BOOKING_TERMS_VERSION,tour_keys:["escuna"],language:"pt"});
    expect(vi.mocked(createReservaVoucherInDb).mock.calls[0][0].terms_acceptance).not.toHaveProperty("accepted_at");
    await waitFor(()=>expect(screen.getByTestId("summary")).toHaveTextContent("Mensagem original com voucher"));
    const base = vi.mocked(issueReservaVouchers).mock.calls[0][0].messageBase;
    expect(base).toContain("NOVA RESERVA");
    expect(base).not.toContain("Declaro que li");
    expect(base).not.toContain(BOOKING_TERMS_VERSION);
  });
});
