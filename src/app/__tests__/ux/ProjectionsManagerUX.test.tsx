import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectionsManager from '../../components/projections/ProjectionsManager';
import { useProjections } from '../../hooks/useProjections';

// Mock le hook useProjections
jest.mock('../../hooks/useProjections', () => ({
  useProjections: jest.fn(),
}));

describe('ProjectionsManager UX', () => {
  const mockRevenueProjections = [
    {
      id: 'rev-1',
      planId: 'plan-1',
      name: 'Projection de revenus 2023',
      description: 'Projection annuelle',
      totalRevenue: 100000,
      formattedTotalRevenue: '100 000 €',
      percentGrowth: '10.0%',
      period: { periodType: 'annual' },
      scenarios: [
        {
          id: 'scenario-1',
          name: 'Scénario de base',
          description: 'Projection standard',
          projectedRevenue: 100000,
          formattedRevenue: '100 000 €',
          probabilityPercentage: 70,
          isPreferred: true,
          colorCode: '#4CAF50'
        }
      ],
      breakEvenAnalysis: {
        breakEvenPoint: 80000,
        formattedBreakEvenPoint: '80 000 €',
        breakEvenDate: '2023-05-01T00:00:00.000Z',
        formattedBreakEvenDate: '01/05/2023',
        monthsToBreakEven: 5,
        formattedMonthsToBreakEven: '5',
        statusColor: '#FFC107'
      },
      isEditable: true
    }
  ];
  
  const mockFinancialProjections = [
    {
      id: 'fin-1',
      planId: 'plan-1',
      name: 'Projection financière 2023',
      description: 'États financiers prévisionnels',
      totalRevenue: 100000,
      totalExpenses: 70000,
      netProfit: 30000,
      formattedTotalRevenue: '100 000 €',
      formattedTotalExpenses: '70 000 €',
      formattedNetProfit: '30 000 €',
      profitMargin: '30.0%',
      period: { periodType: 'annual' },
      incomeStatement: {
        revenue: 100000,
        formattedRevenue: '100 000 €',
        costOfSales: 40000,
        formattedCostOfSales: '40 000 €',
        grossProfit: 60000,
        formattedGrossProfit: '60 000 €',
        operatingExpenses: 30000,
        formattedOperatingExpenses: '30 000 €',
        operatingProfit: 30000,
        formattedOperatingProfit: '30 000 €',
        taxes: 0,
        formattedTaxes: '0 €',
        netProfit: 30000,
        formattedNetProfit: '30 000 €',
        grossProfitMargin: '60.0%',
        operatingProfitMargin: '30.0%',
        netProfitMargin: '30.0%'
      },
      cashFlowStatement: {
        operatingCashFlow: 35000,
        formattedOperatingCashFlow: '35 000 €',
        netCashFlow: 30000,
        formattedNetCashFlow: '30 000 €',
        cashFlowTrend: 'positive'
      },
      profitabilityAnalysis: {
        roi: 15,
        formattedROI: '15.00%',
        npv: 50000,
        formattedNPV: '50 000 €',
        irr: 18,
        formattedIRR: '18.00%',
        paybackPeriod: 3.5,
        formattedPaybackPeriod: '3.5 mois',
        npvStatus: 'positive',
        roiComparison: 'good'
      },
      isEditable: true
    }
  ];
  
  const mockHookImplementation = {
    revenueProjections: mockRevenueProjections,
    financialProjections: mockFinancialProjections,
    isLoading: false,
    error: null,
    createRevenueProjection: jest.fn(),
    createFinancialProjection: jest.fn(),
    updateRevenueProjection: jest.fn(),
    updateFinancialProjection: jest.fn(),
    deleteRevenueProjection: jest.fn(),
    deleteFinancialProjection: jest.fn(),
    saveProjections: jest.fn().mockResolvedValue(true)
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useProjections as jest.Mock).mockReturnValue(mockHookImplementation);
    
    // Mock window.confirm pour les tests de suppression
    global.confirm = jest.fn(() => true);
  });
  
  it('should render revenue projections correctly', () => {
    render(<ProjectionsManager planId="plan-1" />);
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Projections')).toBeInTheDocument();
    
    // Vérifier que l'onglet des projections de revenus est sélectionné par défaut
    const revenueTab = screen.getByText('Projections de Revenus');
    expect(revenueTab).toHaveClass('border-blue-500');
    
    // Vérifier que la liste des projections est affichée
    expect(screen.getByText('Projection de revenus 2023')).toBeInTheDocument();
    
    // Vérifier que les détails de la projection sont affichés
    expect(screen.getByText('100 000 €')).toBeInTheDocument();
    expect(screen.getByText('10.0%')).toBeInTheDocument();
    
    // Vérifier que les scénarios sont affichés
    expect(screen.getByText('Scénario de base')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    
    // Vérifier que l'analyse du seuil de rentabilité est affichée
    expect(screen.getByText('Point d\'équilibre')).toBeInTheDocument();
    expect(screen.getByText('80 000 €')).toBeInTheDocument();
  });
  
  it('should switch to financial projections tab', () => {
    render(<ProjectionsManager planId="plan-1" />);
    
    // Cliquer sur l'onglet des projections financières
    fireEvent.click(screen.getByText('Projections Financières'));
    
    // Vérifier que l'onglet est maintenant sélectionné
    const financialTab = screen.getByText('Projections Financières');
    expect(financialTab).toHaveClass('border-blue-500');
    
    // Vérifier que la liste des projections financières est affichée
    expect(screen.getByText('Projection financière 2023')).toBeInTheDocument();
    
    // Vérifier que les détails financiers sont affichés
    expect(screen.getByText('Revenus')).toBeInTheDocument();
    expect(screen.getByText('Dépenses')).toBeInTheDocument();
    expect(screen.getByText('Bénéfice Net')).toBeInTheDocument();
    
    // Vérifier que le compte de résultat est affiché
    expect(screen.getByText('Compte de Résultat')).toBeInTheDocument();
    expect(screen.getByText('30 000 €')).toBeInTheDocument();
    
    // Vérifier que l'analyse de rentabilité est affichée
    expect(screen.getByText('Analyse de Rentabilité')).toBeInTheDocument();
    expect(screen.getByText('15.00%')).toBeInTheDocument();
  });
  
  it('should create a new revenue projection', async () => {
    mockHookImplementation.createRevenueProjection.mockReturnValue({
      id: 'new-rev',
      planId: 'plan-1',
      name: 'Nouvelle projection de revenus',
      formattedTotalRevenue: '0 €',
      scenarios: [],
      isEditable: true
    });
    
    render(<ProjectionsManager planId="plan-1" />);
    
    // Cliquer sur le bouton de création
    fireEvent.click(screen.getByText('Nouvelle Projection'));
    
    // Vérifier que la fonction de création a été appelée
    expect(mockHookImplementation.createRevenueProjection).toHaveBeenCalledTimes(1);
  });
  
  it('should update a revenue projection', () => {
    render(<ProjectionsManager planId="plan-1" />);
    
    // Rechercher le champ de saisie pour le nom
    const nameInput = screen.getByLabelText('Nom');
    
    // Modifier la valeur
    fireEvent.change(nameInput, { target: { value: 'Projection modifiée' } });
    
    // Vérifier que la fonction de mise à jour a été appelée
    expect(mockHookImplementation.updateRevenueProjection).toHaveBeenCalledTimes(1);
    expect(mockHookImplementation.updateRevenueProjection).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rev-1',
        name: 'Projection modifiée'
      })
    );
  });
  
  it('should delete a revenue projection', () => {
    render(<ProjectionsManager planId="plan-1" />);
    
    // Trouver le bouton de suppression
    const deleteButton = screen.getByRole('button', { name: '' }); // Le bouton a une icône sans texte
    
    // Cliquer sur le bouton de suppression
    fireEvent.click(deleteButton);
    
    // Vérifier que la confirmation a été demandée
    expect(global.confirm).toHaveBeenCalled();
    
    // Vérifier que la fonction de suppression a été appelée
    expect(mockHookImplementation.deleteRevenueProjection).toHaveBeenCalledWith('rev-1');
  });
  
  it('should save projections', async () => {
    render(<ProjectionsManager planId="plan-1" />);
    
    // Trouver le bouton de sauvegarde
    const saveButton = screen.getByText('Sauvegarder');
    
    // Cliquer sur le bouton de sauvegarde
    fireEvent.click(saveButton);
    
    // Vérifier que la fonction de sauvegarde a été appelée
    expect(mockHookImplementation.saveProjections).toHaveBeenCalledTimes(1);
  });
  
  it('should handle loading state', () => {
    (useProjections as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      isLoading: true
    });
    
    render(<ProjectionsManager planId="plan-1" />);
    
    // Vérifier que le message de chargement est affiché
    expect(screen.getByText('Chargement des projections...')).toBeInTheDocument();
  });
  
  it('should handle error state', () => {
    (useProjections as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      isLoading: false,
      error: 'Erreur lors du chargement des projections'
    });
    
    render(<ProjectionsManager planId="plan-1" />);
    
    // Vérifier que le message d'erreur est affiché
    expect(screen.getByText('Erreur: Erreur lors du chargement des projections')).toBeInTheDocument();
  });
  
  it('should show empty state when no projections', () => {
    (useProjections as jest.Mock).mockReturnValue({
      ...mockHookImplementation,
      revenueProjections: [],
      financialProjections: []
    });
    
    render(<ProjectionsManager planId="plan-1" />);
    
    // Vérifier que le message d'absence de projections est affiché
    expect(screen.getByText('Aucune projection de revenus. Créez-en une nouvelle pour commencer.')).toBeInTheDocument();
  });
});