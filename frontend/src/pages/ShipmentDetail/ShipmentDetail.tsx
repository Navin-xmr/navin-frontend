import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import Breadcrumb from "../../components/ui/Breadcrumb";
import MilestoneTimeline, {
    TimelineMilestone,
} from "../../components/shipment/MilestoneTimeline";
import ShipmentDetailHeader from "./ShipmentDetailHeader/ShipmentDetailHeader";
import ShipmentMap from "./ShipmentMap/ShipmentMap";
import DeliveryProofUpload from "./DeliveryProofUpload/DeliveryProofUpload";
import DocumentsSection from "../Shipment/sections/DocumentsSection/DocumentsSection";
import DeliveryConfirmation from "../../components/shipment/DeliveryConfirmation/DeliveryConfirmation";
import PaymentStatus, { PaymentData } from "./PaymentStatus/PaymentStatus";
import SensorDataCards, { SensorData } from "./SensorDataCards/SensorDataCards";
import EscrowStatus from "./EscrowStatus/EscrowStatus";
import { useRealtimeEvents } from "../../hooks/useRealtimeEvents";
import { useAuthContext } from "../../context/AuthContext";
import { can } from "../../utils/rbac";
import NotesSection from "../Shipment/sections/NotesSection/NotesSection";
import { useLiveRegion } from "../../context/LiveRegionContext";

const ShipmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { role } = useAuthContext();
    const isOnline = useOnlineStatus();
    const { announce } = useLiveRegion();

    const [currentStatus, setCurrentStatus] = useState("IN_TRANSIT");

    const events = useRealtimeEvents(['shipment:status', 'shipment:milestone']);
    const statusEvent = events['shipment:status'];
    React.useEffect(() => {
        if (statusEvent && statusEvent.shipmentId === id) {
            Promise.resolve().then(() => {
                setCurrentStatus(statusEvent.newStatus);
                announce(`Shipment status updated to ${statusEvent.newStatus}`);
            });
        }
    }, [statusEvent, id, announce]);

    const shipmentHeaderData = {
        shipmentId: id ? `#${id}` : "#SHP-992834",
        trackingNumber: id ?? "SHP-992834", // TODO: swap for real public tracking token once backend exposes one
        status: currentStatus,
        originAddress: "New York Distribution Center, NY 10001",
        destinationAddress: "123 Main Street, Boston, MA 02101",
        expectedDeliveryDate: "Oct 24, 2026 by 5:00 PM EST",
        userRole: (role ?? "customer") as "company" | "customer",
    };

    const handleUpdateStatus = () => { console.log("Update status clicked"); };
    const handleTrack = () => { console.log("Track clicked"); };

    const mockPaymentData: PaymentData | null = {
        amount: "1,500.00",
        tokenSymbol: "XLM",
        status: "escrowed",
        payerAddress: "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        payeeAddress: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB",
        transactionHash: "a]b c9d4e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9",
    };

    const mockSensorData: SensorData | null = {
        temperature: { value: 22, unit: "°C", lastUpdated: "2026-02-23 09:15 AM EST" },
        humidity: { value: 45, unit: "%", lastUpdated: "2026-02-23 09:15 AM EST" },
        gps: { latitude: 42.3601, longitude: -71.0589, lastUpdated: "2026-02-23 09:10 AM EST" },
        shockTilt: { eventCount: 2, lastUpdated: "2026-02-22 03:45 PM EST" },
    };

    const mockMilestones: TimelineMilestone[] = [
        { id: "1", eventType: "PICKED_UP", name: "Picked up by carrier", timestamp: "2026-02-20 02:30 PM EST", location: "New York Distribution Center, NY", status: "completed", txHash: "3389e9f0f5b3d4c2a1b0e9f8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8" },
        { id: "2", eventType: "IN_TRANSIT", name: "In transit — Philadelphia hub", timestamp: "2026-02-21 08:45 AM EST", location: "Philadelphia Logistics Hub, PA", status: "completed", txHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90" },
        { id: "3", eventType: "CUSTOMS", name: "Customs cleared", timestamp: "2026-02-22 07:10 AM EST", location: "Boston Regional Facility, MA", status: "completed", txHash: "f1e2d3c4b5a60918273645546372819a0b1c2d3e4f5061728394a5b6c7d8e9f0" },
        { id: "4", eventType: "IN_TRANSIT", name: "Out for delivery", timestamp: "2026-02-23 09:00 AM EST", location: "Boston, MA", status: "active" },
        { id: "5", eventType: "DELIVERED", name: "Delivered", timestamp: "Expected: 2026-02-23 05:00 PM EST", location: "Boston, MA", status: "pending" },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_50%_0%,#0a3d3a_0%,#061e20_35%,#020d10_70%,#000_100%)] px-8 py-16 md:px-4 md:py-8 sm:px-3 sm:py-6 font-sans">
            <div className="max-w-300 mx-auto relative z-10">
                <Breadcrumb
                    items={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Shipments', href: '/dashboard/shipments' },
                        { label: id ? `#${id}` : '#SHP-992834' },
                    ]}
                />

                <div className="text-center mb-16 md:mb-10">
                    <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(2.5rem,7vw,5rem)] font-normal tracking-[0.04em] leading-[1.1] text-white m-0 mb-4">
                        SHIPMENT <span className="text-[#00d4c8]">DETAILS</span>
                    </h1>
                    <p className="text-[clamp(0.95rem,2vw,1.1rem)] font-light leading-[1.7] text-[rgba(200,230,240,0.75)] max-w-150 mx-auto">
                        Track your shipment's journey with blockchain-verified milestones
                    </p>
                </div>

                <div className="bg-[rgba(8,40,50,0.4)] border-[1.5px] border-[rgba(0,180,160,0.3)] rounded-3xl p-8 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] md:p-5 md:rounded-2xl sm:p-4">
                    <ShipmentMap
                        origin={shipmentHeaderData.originAddress}
                        destination={shipmentHeaderData.destinationAddress}
                    />
                    <ShipmentDetailHeader
                        {...shipmentHeaderData}
                        onUpdateStatus={handleUpdateStatus}
                        onTrack={handleTrack}
                    />
                    <div className="h-px bg-[rgba(0,212,200,0.2)] my-8" />
                    <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white mt-10 mb-0 text-center md:mb-8">
                        MILESTONE <span className="text-[#00d4c8]">TIMELINE</span>
                    </h2>
                    <MilestoneTimeline milestones={mockMilestones} />
                </div>

                <SensorDataCards sensorData={mockSensorData} />
                <PaymentStatus payment={mockPaymentData} />
                <EscrowStatus shipmentId={id ?? shipmentHeaderData.shipmentId} />

                {can(role, 'shipment:upload-proof') && (
                    <DeliveryProofUpload shipmentId={id || shipmentHeaderData.shipmentId} />
                )}

                <DocumentsSection
                    shipmentId={id || shipmentHeaderData.shipmentId}
                    userRole={shipmentHeaderData.userRole}
                />

                {can(role, 'shipment:confirm-milestone') && (
                    <DeliveryConfirmation
                        shipmentId={shipmentHeaderData.shipmentId}
                        status={shipmentHeaderData.status}
                        onConfirm={async (confirmId, rating, feedback) => {
                            console.log("Delivery confirmed", { confirmId, rating, feedback });
                        }}
                    />
                )}

                {!isOnline && (
                    <div className="p-4 rounded-xl border border-border text-text-secondary text-sm text-center">
                        Upload Proof requires an internet connection.
                    </div>
                )}

                <NotesSection
                    shipmentId={id ?? shipmentHeaderData.shipmentId}
                    userRole={shipmentHeaderData.userRole}
                />
            </div>
        </div>
    );
};

export default ShipmentDetail;