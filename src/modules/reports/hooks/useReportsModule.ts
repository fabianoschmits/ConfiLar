import { useState, useCallback, useEffect } from "react";
import { reportService } from "../services/reportService";
import { Report, CreateReportDTO } from "../types";

export function useReportsModule(userId?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReports = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await reportService.getUserReports(userId);
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchReportDetails = useCallback(async (reportId: string) => {
    setIsLoading(true);
    try {
      const data = await reportService.getReportById(reportId);
      setCurrentReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReport = useCallback(
    async (data: CreateReportDTO) => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const report = await reportService.createReport(userId, data);
        await fetchUserReports();
        return report;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchUserReports],
  );

  const updateStatus = useCallback(
    async (reportId: string, status: string, resolution?: string) => {
      setIsLoading(true);
      try {
        await reportService.updateReportStatus(reportId, status, resolution);
        if (currentReport?.id === reportId) {
          await fetchReportDetails(reportId);
        }
        await fetchUserReports();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentReport, fetchReportDetails, fetchUserReports],
  );

  return {
    reports,
    currentReport,
    isLoading,
    error,
    fetchUserReports,
    fetchReportDetails,
    createReport,
    updateStatus,
  };
}
