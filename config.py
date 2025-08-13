import networkx as nx
import matplotlib.pyplot as plt

# Criar grafo
G = nx.Graph()

# Adicionar nós
for i in range(5):
    G.add_node(i)

# Lista de arestas
arestas = [(0, 1), (0, 2), (1, 3), (2, 4)]

# Adicionar arestas com for
for u, v in arestas:
    G.add_edge(u, v)

# Desenhar grafo
nx.draw(G, with_labels=True, node_color="lightblue", font_weight="bold")
plt.show()
