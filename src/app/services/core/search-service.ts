import { ServiceResult } from '../interfaces/service-interfaces';

// Types associés à la recherche
export interface SearchQuery {
  term: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResultItem {
  id: string;
  type: 'plan' | 'task' | 'project' | 'user';
  title: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SearchResults {
  items: SearchResultItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

export interface SearchService {
  search(query: SearchQuery): Promise<ServiceResult<SearchResults>>;
  getSuggestions(term: string): Promise<ServiceResult<string[]>>;
  getFilterOptions(): Promise<ServiceResult<FilterOption[]>>;
}

export class SearchServiceImpl implements SearchService {
  // Implémentation simulée pour le développement
  private mockData: SearchResultItem[] = [
    {
      id: '1',
      type: 'plan',
      title: 'Plan de développement Q2',
      description: 'Plan détaillé pour le développement du second trimestre',
      tags: ['development', 'planning', 'Q2'],
      createdAt: '2025-04-10T10:00:00Z',
      updatedAt: '2025-04-15T14:30:00Z',
      status: 'active',
      owner: 'John Doe',
    },
    {
      id: '2',
      type: 'task',
      title: 'Implémenter l\'authentification',
      description: 'Créer le système d\'authentification avec JWT',
      tags: ['feature', 'security', 'auth'],
      createdAt: '2025-04-12T09:15:00Z',
      updatedAt: '2025-04-14T11:20:00Z',
      status: 'completed',
      assignee: 'Jane Smith',
    },
    {
      id: '3',
      type: 'project',
      title: 'DevIndé Tracker',
      description: 'Application de suivi de développement indépendant',
      tags: ['main', 'tracking', 'indie'],
      createdAt: '2025-03-01T08:00:00Z',
      updatedAt: '2025-05-01T16:45:00Z',
      status: 'active',
      members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
    },
    {
      id: '4',
      type: 'user',
      title: 'John Doe',
      description: 'Développeur principal',
      tags: ['admin', 'developer'],
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-04-20T09:10:00Z',
      email: 'john.doe@example.com',
      role: 'admin',
    },
    {
      id: '5',
      type: 'plan',
      title: 'Roadmap marketing 2025',
      description: 'Stratégie marketing pour l\'année 2025',
      tags: ['marketing', 'strategy', '2025'],
      createdAt: '2025-04-05T13:20:00Z',
      updatedAt: '2025-04-18T15:10:00Z',
      status: 'draft',
      owner: 'Jane Smith',
    },
    {
      id: '6',
      type: 'task',
      title: 'Ajouter des fonctionnalités de recherche',
      description: 'Implémenter un système de recherche et de filtrage complet',
      tags: ['feature', 'ux', 'search'],
      createdAt: '2025-04-20T11:00:00Z',
      updatedAt: '2025-05-02T14:30:00Z',
      status: 'in-progress',
      assignee: 'John Doe',
    },
    {
      id: '7',
      type: 'user',
      title: 'Jane Smith',
      description: 'Chef de projet',
      tags: ['manager', 'design'],
      createdAt: '2025-01-20T09:45:00Z',
      updatedAt: '2025-04-18T10:30:00Z',
      email: 'jane.smith@example.com',
      role: 'user',
    },
    {
      id: '8',
      type: 'project',
      title: 'Design System',
      description: 'Système de design pour l\'application DevIndé Tracker',
      tags: ['design', 'ui', 'components'],
      createdAt: '2025-03-15T09:00:00Z',
      updatedAt: '2025-04-10T11:15:00Z',
      status: 'active',
      members: ['Jane Smith', 'Bob Johnson'],
    },
    {
      id: '9',
      type: 'task',
      title: 'Optimiser les performances',
      description: 'Améliorer les performances de chargement de l\'application',
      tags: ['optimization', 'performance', 'speed'],
      createdAt: '2025-04-25T14:00:00Z',
      updatedAt: '2025-05-01T10:20:00Z',
      status: 'pending',
      assignee: 'Bob Johnson',
    },
    {
      id: '10',
      type: 'plan',
      title: 'Plan de test Q2',
      description: 'Plan de test pour les fonctionnalités du second trimestre',
      tags: ['testing', 'qa', 'Q2'],
      createdAt: '2025-04-08T15:30:00Z',
      updatedAt: '2025-04-12T09:45:00Z',
      status: 'active',
      owner: 'Bob Johnson',
    }
  ];

  private mockSuggestions: string[] = [
    'authentification',
    'recherche',
    'développement',
    'performance',
    'marketing',
    'design',
    'plan',
    'projet',
    'tâche',
    'utilisateur',
    'sécurité',
    'optimisation',
    'interface',
    'test',
    'stratégie'
  ];

  private mockFilterOptions: FilterOption[] = [
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox',
      options: [
        { value: 'plan', label: 'Plans' },
        { value: 'task', label: 'Tâches' },
        { value: 'project', label: 'Projets' },
        { value: 'user', label: 'Utilisateurs' }
      ]
    },
    {
      id: 'status',
      label: 'Statut',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'completed', label: 'Terminé' },
        { value: 'in-progress', label: 'En cours' },
        { value: 'pending', label: 'En attente' },
        { value: 'draft', label: 'Brouillon' }
      ]
    },
    {
      id: 'dateRange',
      label: 'Date de création',
      type: 'dateRange'
    },
    {
      id: 'sortBy',
      label: 'Trier par',
      type: 'select',
      options: [
        { value: 'createdAt', label: 'Date de création' },
        { value: 'updatedAt', label: 'Date de mise à jour' },
        { value: 'title', label: 'Titre' }
      ]
    }
  ];

  /**
   * Recherche des éléments selon les critères spécifiés
   */
  async search(query: SearchQuery): Promise<ServiceResult<SearchResults>> {
    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));

      // Filtrer les résultats en fonction du terme de recherche
      let results = this.mockData.filter(item => {
        const term = query.term.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchDescription = item.description?.toLowerCase().includes(term) || false;
        const matchTags = item.tags?.some(tag => tag.toLowerCase().includes(term)) || false;
        
        return matchTitle || matchDescription || matchTags;
      });

      // Appliquer les filtres supplémentaires s'ils sont spécifiés
      if (query.filters) {
        if (query.filters.type && query.filters.type.length > 0) {
          results = results.filter(item => 
            Array.isArray(query.filters?.type) 
              ? query.filters?.type.includes(item.type)
              : item.type === query.filters?.type
          );
        }

        if (query.filters.status && query.filters.status.length > 0) {
          results = results.filter(item => 
            Array.isArray(query.filters?.status) 
              ? query.filters?.status.includes(item.status)
              : item.status === query.filters?.status
          );
        }

        // Filtrage par date
        if (query.filters.dateFrom) {
          const dateFrom = new Date(query.filters.dateFrom);
          results = results.filter(item => new Date(item.createdAt || '') >= dateFrom);
        }

        if (query.filters.dateTo) {
          const dateTo = new Date(query.filters.dateTo);
          results = results.filter(item => new Date(item.createdAt || '') <= dateTo);
        }
      }

      // Tri des résultats
      if (query.sortBy) {
        const sortField = query.sortBy;
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
        
        results.sort((a, b) => {
          const valueA = a[sortField];
          const valueB = b[sortField];
          
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortOrder * valueA.localeCompare(valueB);
          }
          
          if (valueA < valueB) return -1 * sortOrder;
          if (valueA > valueB) return 1 * sortOrder;
          return 0;
        });
      }

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: paginatedResults,
          totalCount: results.length,
          currentPage: page,
          totalPages: Math.ceil(results.length / limit),
          hasMore: endIndex < results.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Une erreur est survenue lors de la recherche',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Récupère des suggestions d'autocomplétion basées sur le terme saisi
   */
  async getSuggestions(term: string): Promise<ServiceResult<string[]>> {
    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 100));

      // Filtre les suggestions qui correspondent au terme de recherche
      const filteredSuggestions = this.mockSuggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 5); // Limite à 5 suggestions

      return {
        success: true,
        data: filteredSuggestions
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUGGESTION_ERROR',
          message: 'Une erreur est survenue lors de la récupération des suggestions',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Récupère les options de filtrage disponibles
   */
  async getFilterOptions(): Promise<ServiceResult<FilterOption[]>> {
    try {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        success: true,
        data: this.mockFilterOptions
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILTER_OPTIONS_ERROR',
          message: 'Une erreur est survenue lors de la récupération des options de filtrage',
          details: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
}
