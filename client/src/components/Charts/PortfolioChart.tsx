interface PortfolioChartProps {
  portfolioId?: string;
}

export default function PortfolioChart({ portfolioId }: PortfolioChartProps) {
  return (
    <div className="w-full h-64 bg-card rounded-lg border flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <div className="text-lg font-medium">Portfolio Performance</div>
        <div className="text-sm">Chart visualization will be implemented</div>
      </div>
    </div>
  );
}