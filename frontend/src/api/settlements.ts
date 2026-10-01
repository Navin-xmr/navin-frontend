import axios from 'axios';

export const fetchSettlements = async (startDate: string, endDate: string, page: number) => {
  const response = await axios.get(`/api/settlements?startDate=${startDate}&endDate=${endDate}&page=${page}`);
  return response.data;
};

export const fetchSettlementSummary = async (startDate: string, endDate: string) => {
  const response = await axios.get(`/api/settlements/summary?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};