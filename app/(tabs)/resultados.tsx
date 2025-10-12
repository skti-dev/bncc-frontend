import { BaseColors, DisciplineColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDisciplineName } from '@/hooks/use-discipline-theme';
import { MeuResultado, resultsService } from '@/services/resultsApi';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MeusResultadosScreen() {
  const { user } = useAuth();
  const [resultados, setResultados] = useState<MeuResultado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const loadResultados = useCallback(async (page: number = 1, refresh: boolean = false) => {
    if (!user?.email) return;

    if (refresh) {
      setIsRefreshing(true);
    } else if (page === 1) {
      setIsLoading(true);
    }

    try {
      const response = await resultsService.getMeusResultados({
        page,
        email: user.email,
      });

      if (!response.success || !response.data) {
        Alert.alert('Erro', response.message || 'Erro ao carregar resultados');
        return;
      }

      const { data, totalPages: total, hasNext: next } = response.data;
      
      if (page === 1) {
        setResultados(data);
      } else {
        setResultados(prev => [...prev, ...data]);
      }
      
      setCurrentPage(page);
      setTotalPages(total);
      setHasNext(next);

    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        loadResultados(1);
      }
    }, [user?.email, loadResultados])
  );

  const handleRefresh = () => {
    setCurrentPage(1);
    loadResultados(1, true);
  };

  const handleLoadMore = () => {
    if (hasNext && !isLoading) {
      loadResultados(currentPage + 1);
    }
  };

  const handleVerDetalhes = (resultadoId: string) => {
    router.push({
      pathname: '/resultado-detalhes/[id]',
      params: { id: resultadoId }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisciplinaColor = (disciplina: string): string => {
    switch (disciplina) {
      case 'LP': return DisciplineColors.portugues.primary;
      case 'MA': return DisciplineColors.matematica.primary;
      case 'CI': return DisciplineColors.ciencias.primary;
      default: return BaseColors.gray[400];
    }
  };

  const renderResultado = ({ item }: { item: MeuResultado }) => {
    const disciplinaColor = getDisciplinaColor(item.disciplina);
    const disciplinaNome = getDisciplineName(item.disciplina as any);

    return (
      <View style={styles.resultadoCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.disciplinaTag, { backgroundColor: disciplinaColor }]}>
            <Text style={styles.disciplinaText}>{disciplinaNome}</Text>
          </View>
          <Text style={styles.dataText}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.estatisticasRow}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaLabel}>Pontuação</Text>
              <Text style={styles.estatisticaValor}>
                {item.pontuacao}/{item.total_questoes}
              </Text>
            </View>
            
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaLabel}>Acertos</Text>
              <Text style={[
                styles.estatisticaValor,
                { color: item.percentual_acerto >= 70 ? BaseColors.success : item.percentual_acerto >= 50 ? BaseColors.warning : BaseColors.error }
              ]}>
                {item.percentual_acerto.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaLabel}>Ano</Text>
              <Text style={styles.estatisticaValor}>{item.ano}º ano</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.detalhesButton}
            onPress={() => handleVerDetalhes(item.id)}
          >
            <Text style={styles.detalhesButtonText}>📊 Ver Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>📊</Text>
      <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Complete alguns questionários para ver seus resultados aqui!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || currentPage === 1) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={BaseColors.info} />
        <Text style={styles.loadingText}>Carregando mais resultados...</Text>
      </View>
    );
  };

  if (isLoading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BaseColors.info} />
        <Text style={styles.loadingText}>Carregando seus resultados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Meus Resultados</Text>
        <Text style={styles.subtitle}>
          {resultados.length > 0 
            ? `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`
            : 'Nenhum resultado'
          }
        </Text>
      </View>

      <FlatList
        data={resultados}
        renderItem={renderResultado}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[BaseColors.info]}
            tintColor={BaseColors.info}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />

      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationText}>
            Página {currentPage} de {totalPages}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BaseColors.gray[50],
  },
  header: {
    backgroundColor: BaseColors.info,
    padding: 20,
    paddingTop: 60,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BaseColors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColors.gray[50],
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: BaseColors.gray[600],
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  resultadoCard: {
    backgroundColor: BaseColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  disciplinaTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  disciplinaText: {
    color: BaseColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dataText: {
    fontSize: 14,
    color: BaseColors.gray[600],
  },
  cardContent: {
    gap: 10,
  },
  estatisticasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: BaseColors.gray[600],
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  estatisticaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BaseColors.gray[900],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BaseColors.gray[900],
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: BaseColors.gray[600],
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BaseColors.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: BaseColors.gray[200],
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: BaseColors.gray[600],
    fontWeight: '500',
  },
  detalhesButton: {
    backgroundColor: BaseColors.info,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  detalhesButtonText: {
    color: BaseColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});