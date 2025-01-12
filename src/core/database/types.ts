export interface Budget {
  id: number;
  name: string;
  category: string;
  budget: number;
  alert?: boolean;
  month: number;
  year: number;
  userId: number;
  amount?: number;
  order: number;
}

export function isBudget(item: any): item is Budget {
  return (
    typeof (item as Budget).budget === "number" &&
    typeof (item as Budget).name === "string" &&
    typeof (item as Budget).month === "number" &&
    typeof (item as Budget).year === "number" &&
    typeof (item as Budget).userId === "number"
  );
}

export interface Transaction {
  id: number;
  type: string;
  name: string;
  transaction: string;
  amount: number;
  category: string;
  date: string;
  userId: number;
  order: number;
}

export function isTransaction(item: any): item is Transaction {
  return (
    typeof (item as Transaction).amount === "number" &&
    typeof (item as Transaction).name === "string" &&
    typeof (item as Transaction).userId === "number"
  );
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  userId: number;
  order: number;
}

export function isCategory(item: any): item is Category {
  return (
    typeof (item as Category).name === "string" &&
    typeof (item as Category).userId === "number"
  );
}

export interface User {
  notifications?: any;
  id: number;
  firstname: string;
  lastname: string;
  password: string;
  email: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
  currency: string;
  adress?: string;
  token?: string;
  tokenExpiry?: Date;
}

export function isUser(item: any): item is User {
  return (
    typeof (item as User).firstname === "string" &&
    typeof (item as User).lastname === "string" &&
    typeof (item as User).email === "string" &&
    typeof (item as User).password === "string" &&
    (item as User).createdAt instanceof Date &&
    (item as User).updatedAt instanceof Date
  );
}

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  pointBorderWidth?: number;
  pointRadius?: number;
  tension?: number;
  fill?: boolean;
  borderRadius?: number;
}

// Add Google Maps types
declare global {
  interface Window {
    google: any;
  }

  interface Navigator {
    brave?: {
      isBrave: () => boolean;
    };
  }
}

export interface ChartScale {
  title: {
    display: boolean;
    text: string;
    color?: string;
  };
  ticks?: {
    font?: {
      size: number;
    };
  };
  grid?: {
    borderColor: string;
  };
  beginAtZero?: boolean;
}

export interface ChartTooltip {
  enabled: boolean;
  titleColor?: string;
  bodyColor?: string;
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: { display: boolean };
    tooltip: ChartTooltip;
  };
  scales?: {
    x?: ChartScale;
    y?: ChartScale;
  };
  layout?: {
    padding?: {
      top: number;
    };
  };
  x?: {
    categoryPercentage: number;
  };
}
