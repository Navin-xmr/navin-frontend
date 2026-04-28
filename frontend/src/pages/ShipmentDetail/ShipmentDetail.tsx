import React from "react";
import MilestoneTimeline, {
    MilestoneDetail,
} from "./MilestoneTimeline/MilestoneTimeline";
import ShipmentDetailHeader from "./ShipmentDetailHeader/ShipmentDetailHeader";
import ShipmentMap from "./ShipmentMap/ShipmentMap";
import DeliveryProofUpload from "./DeliveryProofUpload/DeliveryProofUpload";
import DeliveryConfirmation from "../../components/shipment/DeliveryConfirmation/DeliveryConfirmation";
import PaymentStatus, { PaymentData } from "./PaymentStatus/PaymentStatus";
import SensorDataCards, { SensorData } from "./SensorDataCards/SensorDataCards";

const ShipmentDetail: React.FC = () => {
    const shipmentHeaderData = {
        shipmentId: "#SHP-992834",
        status: "in_transit" as const,
        originAddress: "New York Distribution Center, NY 10001",
        destinationAddress: "123 Main Street, Boston, MA 02101",
        expectedDeliveryDate: "Oct 24, 2026 by 5:00 PM EST",
        userRole: "company" as const,
    };

    const handleUpdateStatus = () => {
        console.log("Update status clicked");
    };
    const handleTrack = () => {
        console.log("Track clicked");
    };

    // Mock payment data - set to null to show empty state
    const mockPaymentData: PaymentData | null = {
        amount: "1,500.00",
        tokenSymbol: "XLM",
        status: "escrowed",
        payerAddress:
            "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        payeeAddress:
            "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB",
        transactionHash:
            "a]b c9d4e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9",
    };

    // Mock sensor data - set to null to show empty state
    const mockSensorData: SensorData | null = {
        temperature: {
            value: 22,
            unit: "°C",
            lastUpdated: "2026-02-23 09:15 AM EST",
        },
        humidity: {
            value: 45,
            unit: "%",
            lastUpdated: "2026-02-23 09:15 AM EST",
        },
        gps: {
            latitude: 42.3601,
            longitude: -71.0589,
            lastUpdated: "2026-02-23 09:10 AM EST",
        },
        shockTilt: {
            eventCount: 2,
            lastUpdated: "2026-02-22 03:45 PM EST",
        },
    };

    const mockMilestones: MilestoneDetail[] = [
        {
            id: "1",
            name: "Order Confirmed",
            timestamp: "2026-02-20 09:15 AM EST",
            location: "New York Distribution Center, NY",
            blockchainAddress: "GABCD1234567890WXYZ1234567890ABCDEF",
            status: "completed",
            notes: "Order successfully confirmed and payment verified on blockchain. Shipment prepared for pickup.",
            sensorReadings: {
                temperature: "22°C",
                humidity: "45%",
                pressure: "1013 hPa",
            },
        },
        {
            id: "2",
            name: "Picked Up by Carrier",
            timestamp: "2026-02-20 02:30 PM EST",
            location: "New York Distribution Center, NY",
            blockchainAddress: "GEFGH2345678901YZAB2345678901BCDEFG",
            status: "completed",
            notes: "Package picked up by carrier. Driver ID verified and logged on-chain.",
            sensorReadings: {
                temperature: "21°C",
                humidity: "48%",
                pressure: "1012 hPa",
            },
        },
        {
            id: "3",
            name: "In Transit - Philadelphia Hub",
            timestamp: "2026-02-21 08:45 AM EST",
            location: "Philadelphia Logistics Hub, PA",
            blockchainAddress: "GIJKL3456789012ZABC3456789012CDEFGH",
            status: "completed",
            notes: "Shipment arrived at Philadelphia hub. Passed quality inspection.",
            sensorReadings: {
                temperature: "20°C",
                humidity: "50%",
                pressure: "1014 hPa",
            },
        },
        {
            id: "4",
            name: "Departed Philadelphia Hub",
            timestamp: "2026-02-21 03:20 PM EST",
            location: "Philadelphia Logistics Hub, PA",
            blockchainAddress: "GMNOP4567890123ABCD4567890123DEFGHI",
            status: "completed",
            notes: "Package departed Philadelphia hub en route to Boston.",
            sensorReadings: {
                temperature: "19°C",
                humidity: "52%",
                pressure: "1015 hPa",
            },
        },
        {
            id: "5",
            name: "Arrived at Boston Facility",
            timestamp: "2026-02-22 07:10 AM EST",
            location: "Boston Regional Facility, MA",
            blockchainAddress: "GQRST5678901234BCDE5678901234EFGHIJ",
            status: "completed",
            notes: "Shipment arrived at Boston facility. Sorted and prepared for final delivery.",
            sensorReadings: {
                temperature: "18°C",
                humidity: "55%",
                pressure: "1016 hPa",
            },
        },
        {
            id: "6",
            name: "Out for Delivery",
            timestamp: "2026-02-23 09:00 AM EST",
            location: "Boston, MA",
            blockchainAddress: "GUVWX6789012345CDEF6789012345FGHIJK",
            status: "current",
            notes: "Package is currently out for delivery. Driver en route to destination address.",
            sensorReadings: {
                temperature: "17°C",
                humidity: "58%",
                pressure: "1017 hPa",
            },
        },
        {
            id: "7",
            name: "Delivered",
            timestamp: "Expected: 2026-02-23 05:00 PM EST",
            location: "Boston, MA",
            blockchainAddress: "GYZAB7890123456DEFG7890123456GHIJKL",
            status: "upcoming",
            notes: "Estimated delivery time. Signature will be required upon delivery.",
        },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[radial-gradient(ellipse_at_50%_0%,#0a3d3a_0%,#061e20_35%,#020d10_70%,#000_100%)] px-8 py-16 md:px-4 md:py-8 sm:px-3 sm:py-6 font-sans">
            <div className="max-w-300 mx-auto relative z-10">
                {/* Page header */}
                <div className="text-center mb-16 md:mb-10">
                    <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(2.5rem,7vw,5rem)] font-normal tracking-[0.04em] leading-[1.1] text-white m-0 mb-4">
                        SHIPMENT <span className="text-[#00d4c8]">DETAILS</span>
                    </h1>
                    <p className="text-[clamp(0.95rem,2vw,1.1rem)] font-light leading-[1.7] text-[rgba(200,230,240,0.75)] max-w-150 mx-auto">
                        Track your shipment's journey with blockchain-verified
                        milestones
                    </p>
                </div>

                {/* Content card */}
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

                    {/* Divider */}
                    <div className="h-px bg-[rgba(0,212,200,0.2)] my-8" />

                    <h2 className="font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,4vw,2.5rem)] font-normal tracking-[0.04em] leading-[1.2] text-white mt-10 mb-0 text-center md:mb-8">
                        MILESTONE{" "}
                        <span className="text-[#00d4c8]">TIMELINE</span>
                    </h2>
                    <MilestoneTimeline milestones={mockMilestones} />
                </div>

                <SensorDataCards sensorData={mockSensorData} />
                <PaymentStatus payment={mockPaymentData} />
                <DeliveryProofUpload />
                <DeliveryConfirmation
                    shipmentId={shipmentHeaderData.shipmentId}
                    status={shipmentHeaderData.status}
                    onConfirm={async (id, rating, feedback) => {
                        console.log("Delivery confirmed", {
                            id,
                            rating,
                            feedback,
                        });
                    }}
                />
            </div>
        </div>
    );
};

export default ShipmentDetail;
