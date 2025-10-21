"use client"
import React from "react";
import ReferralsDashboard from "./home/ReferralsDashboard";

const Referrals = () => {
  const sampleReferralsData = [
    {
      id: "#REF010",
      name: "Jennifer Tovar",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k960",
      visits: 10,
      earned: 160,
    },
    {
      id: "#REF011",
      name: "John Smith",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k961",
      visits: 15,
      earned: 240,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
    {
      id: "#REF012",
      name: "Sarah Johnson",
      url: "https://dreamslmscourse.com/refer/?refid=345re667877k962",
      visits: 8,
      earned: 128,
    },
  ];
  return (
    <ReferralsDashboard
      netEarnings={12000}
      balance={15000}
      totalReferrals={10}
      referralLink="https://dreamslmscourse.com/refer/?refid=345re66"
      withdrawCommission={25}
      withdrawThreshold={10000}
      referralsData={sampleReferralsData}
      itemsPerPage={10}
    />
  );
};

export default Referrals;
