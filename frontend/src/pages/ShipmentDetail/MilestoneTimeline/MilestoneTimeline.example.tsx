/**
 * Example usage of the MilestoneTimeline component
 * This file demonstrates how to use the expanded milestone timeline in your application
 */

import MilestoneTimeline, { MilestoneDetail } from './MilestoneTimeline';

// Example 1: Complete shipment journey with blockchain verification
export const CompleteShipmentExample = () => {
  const milestones: MilestoneDetail[] = [
    {
      id: '1',
      name: 'Order Confirmed',
      timestamp: '2026-02-20 09:15 AM EST',
      location: 'New York Distribution Center, NY',
      blockchainAddress: 'GABCD1234567890WXYZ1234567890ABCDEF',
      status: 'completed',
      notes: 'Order successfully confirmed and payment verified on blockchain. Shipment prepared for pickup.',
      sensorReadings: {
        temperature: '22°C',
        humidity: '45%',
        pressure: '1013 hPa',
      },
    },
    {
      id: '2',
      name: 'Picked Up by Carrier',
      timestamp: '2026-02-20 02:30 PM EST',
      location: 'New York Distribution Center, NY',
      blockchainAddress: 'GEFGH2345678901YZAB2345678901BCDEFG',
      status: 'completed',
      notes: 'Package picked up by carrier. Driver ID verified and logged on-chain.',
      sensorReadings: {
        temperature: '21°C',
        humidity: '48%',
        pressure: '1012 hPa',
      },
    },
    {
      id: '3',
      name: 'In Transit - Philadelphia Hub',
      timestamp: '2026-02-21 08:45 AM EST',
      location: 'Philadelphia Logistics Hub, PA',
      blockchainAddress: 'GIJKL3456789012ZABC3456789012CDEFGH',
      status: 'completed',
      notes: 'Shipment arrived at Philadelphia hub. Passed quality inspection.',
      sensorReadings: {
        temperature: '20°C',
        humidity: '50%',
        pressure: '1014 hPa',
      },
    },
    {
      id: '4',
      name: 'Out for Delivery',
      timestamp: '2026-02-23 09:00 AM EST',
      location: 'Boston, MA',
      blockchainAddress: 'GMNOP4567890123ABCD4567890123DEFGHI',
      status: 'current',
      notes: 'Package is currently out for delivery. Driver en route to destination.',
      sensorReadings: {
        temperature: '18°C',
        humidity: '55%',
        pressure: '1016 hPa',
      },
    },
    {
      id: '5',
      name: 'Delivered',
      timestamp: 'Expected: 2026-02-23 05:00 PM EST',
      location: 'Boston, MA',
      blockchainAddress: 'GQRST5678901234BCDE5678901234EFGHIJ',
      status: 'upcoming',
      notes: 'Estimated delivery time. Signature will be required upon delivery.',
    },
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#050505', minHeight: '100vh' }}>
      <MilestoneTimeline milestones={milestones} />
    </div>
  );
};

// Example 2: International shipment with customs clearance
export const InternationalShipmentExample = () => {
  const milestones: MilestoneDetail[] = [
    {
      id: '1',
      name: 'Order Placed',
      timestamp: '2026-02-15 10:00 AM CST',
      location: 'Shanghai, China',
      blockchainAddress: 'GUVWX6789012345CDEF6789012345FGHIJK',
      status: 'completed',
      notes: 'International order confirmed. Export documentation prepared.',
      sensorReadings: {
        temperature: '24°C',
        humidity: '60%',
      },
    },
    {
      id: '2',
      name: 'Departed Origin Port',
      timestamp: '2026-02-16 02:00 PM CST',
      location: 'Shanghai Port, China',
      blockchainAddress: 'GYZAB7890123456DEFG7890123456GHIJKL',
      status: 'completed',
      notes: 'Container loaded onto vessel. Sea freight journey initiated.',
      sensorReadings: {
        temperature: '23°C',
        humidity: '65%',
      },
    },
    {
      id: '3',
      name: 'In Transit - Pacific Ocean',
      timestamp: '2026-02-18 08:00 AM PST',
      location: 'Pacific Ocean',
      blockchainAddress: 'GCDEF8901234567EFGH8901234567HIJKLM',
      status: 'completed',
      notes: 'Vessel on schedule. All cargo secure and monitored.',
      sensorReadings: {
        temperature: '22°C',
        humidity: '70%',
      },
    },
    {
      id: '4',
      name: 'Arrived at Destination Port',
      timestamp: '2026-02-22 01:00 PM PST',
      location: 'Los Angeles Port, CA',
      blockchainAddress: 'GHIJK9012345678FGHI9012345678IJKLMN',
      status: 'completed',
      notes: 'Container offloaded. Awaiting customs clearance.',
    },
    {
      id: '5',
      name: 'Customs Clearance',
      timestamp: '2026-02-23 10:30 AM PST',
      location: 'Los Angeles Customs, CA',
      blockchainAddress: 'GLMNO0123456789GHIJ0123456789JKLMNO',
      status: 'current',
      notes: 'Customs inspection in progress. Documentation under review.',
    },
    {
      id: '6',
      name: 'Out for Delivery',
      timestamp: 'Expected: 2026-02-24 09:00 AM PST',
      location: 'Los Angeles, CA',
      blockchainAddress: 'GOPQR1234567890HIJK1234567890KLMNOP',
      status: 'upcoming',
    },
    {
      id: '7',
      name: 'Delivered',
      timestamp: 'Expected: 2026-02-24 05:00 PM PST',
      location: 'Los Angeles, CA',
      blockchainAddress: 'GRSTU2345678901IJKL2345678901LMNOPQ',
      status: 'upcoming',
    },
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#050505', minHeight: '100vh' }}>
      <MilestoneTimeline milestones={milestones} />
    </div>
  );
};

// Example 3: Cold chain shipment with detailed sensor monitoring
export const ColdChainExample = () => {
  const milestones: MilestoneDetail[] = [
    {
      id: '1',
      name: 'Pharmaceutical Order Confirmed',
      timestamp: '2026-02-22 08:00 AM EST',
      location: 'Boston Medical Supply, MA',
      blockchainAddress: 'GVWXY3456789012JKLM3456789012MNOPQR',
      status: 'completed',
      notes: 'Temperature-controlled shipment initiated. Cold chain protocol activated.',
      sensorReadings: {
        temperature: '4°C',
        humidity: '35%',
        pressure: '1015 hPa',
      },
    },
    {
      id: '2',
      name: 'Loaded into Refrigerated Truck',
      timestamp: '2026-02-22 10:30 AM EST',
      location: 'Boston Medical Supply, MA',
      blockchainAddress: 'GYZAB4567890123KLMN4567890123NOPQRS',
      status: 'completed',
      notes: 'Package secured in temperature-controlled compartment. Continuous monitoring active.',
      sensorReadings: {
        temperature: '3°C',
        humidity: '38%',
        pressure: '1014 hPa',
      },
    },
    {
      id: '3',
      name: 'Temperature Alert - Resolved',
      timestamp: '2026-02-22 02:15 PM EST',
      location: 'En route to Hartford, CT',
      blockchainAddress: 'GBCDE5678901234LMNO5678901234OPQRST',
      status: 'completed',
      notes: 'Brief temperature fluctuation detected (5.2°C). Cooling system adjusted. Temperature restored to safe range within 3 minutes.',
      sensorReadings: {
        temperature: '3.5°C',
        humidity: '40%',
        pressure: '1013 hPa',
      },
    },
    {
      id: '4',
      name: 'Arrived at Distribution Center',
      timestamp: '2026-02-22 06:00 PM EST',
      location: 'Hartford Distribution Center, CT',
      blockchainAddress: 'GEFGH6789012345MNOP6789012345PQRSTU',
      status: 'current',
      notes: 'Package transferred to facility cold storage. Quality check in progress.',
      sensorReadings: {
        temperature: '4°C',
        humidity: '36%',
        pressure: '1015 hPa',
      },
    },
    {
      id: '5',
      name: 'Final Delivery',
      timestamp: 'Expected: 2026-02-23 09:00 AM EST',
      location: 'Hartford Hospital, CT',
      blockchainAddress: 'GHIJK7890123456NOPQ7890123456QRSTUV',
      status: 'upcoming',
      notes: 'Scheduled delivery to hospital pharmacy. Cold chain integrity maintained throughout journey.',
    },
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#050505', minHeight: '100vh' }}>
      <MilestoneTimeline milestones={milestones} />
    </div>
  );
};
