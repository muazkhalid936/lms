class EarningsService {
  static async getInstructorEarnings(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.payoutStatus) searchParams.append('payoutStatus', params.payoutStatus);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const response = await fetch(`/api/instructor/earnings?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch earnings');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching earnings'
      };
    }
  }

  static async updatePayoutStatus(earningsIds, payoutStatus, payoutTransactionId = null, notes = '') {
    try {
      const response = await fetch('/api/instructor/earnings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          earningsIds,
          payoutStatus,
          payoutTransactionId,
          notes
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update payout status');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while updating payout status'
      };
    }
  }

  static async getEarningsSummary() {
    try {
      const response = await fetch('/api/instructor/earnings?limit=1', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch earnings summary');
      }

      return {
        success: true,
        data: data.data?.summary || {}
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching earnings summary'
      };
    }
  }

  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static getPayoutStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  static getPayoutStatusText(status) {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processed':
        return 'Processed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }
}

export default EarningsService;