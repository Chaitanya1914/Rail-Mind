"""
RailMind — Dynamic Routing Agent
Agent 3 of 6. Builds a railway network graph and finds alternative routes
when sections are blocked or high-risk.

Uses NetworkX + Dijkstra's algorithm on real Indian Railways data:
  - 5,208 train routes (from trains.json)
  - 8,990 stations (from stations.json)

Usage:
  from agents.routing_agent import RoutingAgent
  agent = RoutingAgent()
  result = agent.find_route("NDLS", "HWH")  # Delhi → Kolkata
  alt = agent.find_alternative("NDLS", "HWH", blocked=["ALD"])  # Avoid Allahabad
"""

import json
import os
import math
import networkx as nx

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


class RoutingAgent:
    """
    Dynamic Routing Agent — builds a railway network graph and provides
    shortest-path routing with the ability to block dangerous sections.
    """

    def __init__(self):
        """Load station and train data, build the network graph."""
        print("[RoutingAgent] Initializing...")

        # Load stations
        with open(os.path.join(DATA_DIR, "stations.json"), "r", encoding="utf-8") as f:
            stations_data = json.load(f)

        self.stations = {}
        for feature in stations_data["features"]:
            props = feature.get("properties", {})
            geom = feature.get("geometry")
            code = props.get("code", "")
            if code:
                coords = geom["coordinates"] if geom else [0, 0]
                self.stations[code] = {
                    "name": props.get("name", "Unknown"),
                    "zone": props.get("zone", ""),
                    "state": props.get("state", ""),
                    "lat": coords[1] if coords else 0,
                    "lon": coords[0] if coords else 0
                }

        print(f"  Loaded {len(self.stations)} stations")

        # Load trains and build graph
        with open(os.path.join(DATA_DIR, "trains.json"), "r", encoding="utf-8") as f:
            trains_data = json.load(f)

        self.trains = []
        self.graph = nx.Graph()  # Undirected — trains run both ways

        for feature in trains_data["features"]:
            props = feature.get("properties", {})
            from_code = props.get("from_station_code", "")
            to_code = props.get("to_station_code", "")
            distance = props.get("distance", 0)
            train_number = props.get("number", "")
            train_name = props.get("name", "")
            train_type = props.get("type", "")
            zone = props.get("zone", "")
            duration_h = props.get("duration_h", 0) or 0
            duration_m = props.get("duration_m", 0) or 0
            total_minutes = int(duration_h) * 60 + int(duration_m)

            if from_code and to_code and distance:
                # Add edge to graph
                distance = int(distance) if distance else 0

                # If edge already exists, keep the shorter distance
                if self.graph.has_edge(from_code, to_code):
                    existing = self.graph[from_code][to_code]["distance"]
                    if distance < existing:
                        self.graph[from_code][to_code]["distance"] = distance
                        self.graph[from_code][to_code]["trains"].append({
                            "number": train_number,
                            "name": train_name,
                            "type": train_type,
                            "duration_min": total_minutes
                        })
                else:
                    self.graph.add_edge(from_code, to_code,
                        distance=distance,
                        zone=zone,
                        trains=[{
                            "number": train_number,
                            "name": train_name,
                            "type": train_type,
                            "duration_min": total_minutes
                        }]
                    )

                self.trains.append({
                    "number": train_number,
                    "name": train_name,
                    "from": from_code,
                    "to": to_code,
                    "distance": distance,
                    "zone": zone,
                    "type": train_type
                })

        # Add station nodes with attributes
        for code, info in self.stations.items():
            if code in self.graph:
                self.graph.nodes[code].update(info)

        print(f"  Loaded {len(self.trains)} train routes")
        print(f"  Graph: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
        print(f"[RoutingAgent] Ready.")

    def _haversine(self, lat1, lon1, lat2, lon2) -> float:
        """Calculate distance between two GPS points in km."""
        R = 6371  # Earth's radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return round(R * c, 1)

    def get_station_info(self, code: str) -> dict:
        """Get station details by code."""
        code = code.upper()
        if code in self.stations:
            info = self.stations[code].copy()
            info["code"] = code
            info["connections"] = list(self.graph.neighbors(code)) if code in self.graph else []
            info["num_connections"] = len(info["connections"])
            return info
        return {"error": f"Station '{code}' not found"}

    def search_station(self, query: str) -> list:
        """Search stations by name or code (fuzzy)."""
        query = query.upper()
        results = []
        for code, info in self.stations.items():
            if query in code or query in info["name"].upper():
                results.append({"code": code, "name": info["name"],
                               "zone": info["zone"], "state": info["state"]})
        return results[:20]

    def find_route(self, source: str, destination: str) -> dict:
        """
        Find the shortest route between two stations.
        Uses Dijkstra's algorithm with distance as weight.
        """
        source = source.upper()
        destination = destination.upper()

        # Validate stations
        if source not in self.graph:
            return {"error": f"Station '{source}' not found in network"}
        if destination not in self.graph:
            return {"error": f"Station '{destination}' not found in network"}

        try:
            # Find shortest path by distance
            path = nx.shortest_path(self.graph, source, destination, weight="distance")
            total_distance = nx.shortest_path_length(self.graph, source, destination, weight="distance")

            # Build route details
            segments = []
            for i in range(len(path) - 1):
                edge = self.graph[path[i]][path[i+1]]
                seg_trains = edge.get("trains", [])
                segments.append({
                    "from": path[i],
                    "from_name": self.stations.get(path[i], {}).get("name", path[i]),
                    "to": path[i+1],
                    "to_name": self.stations.get(path[i+1], {}).get("name", path[i+1]),
                    "distance_km": edge.get("distance", 0),
                    "zone": edge.get("zone", ""),
                    "available_trains": len(seg_trains),
                    "trains": seg_trains[:3]  # Top 3 trains on this segment
                })

            return {
                "source": {"code": source, "name": self.stations.get(source, {}).get("name", source)},
                "destination": {"code": destination, "name": self.stations.get(destination, {}).get("name", destination)},
                "total_distance_km": int(total_distance),
                "num_stops": len(path),
                "path": path,
                "path_names": [self.stations.get(p, {}).get("name", p) for p in path],
                "segments": segments,
                "route_type": "shortest"
            }

        except nx.NetworkXNoPath:
            return {"error": f"No route found between {source} and {destination}"}
        except Exception as e:
            return {"error": str(e)}

    def find_alternative(self, source: str, destination: str,
                         blocked_stations: list = None,
                         blocked_zones: list = None) -> dict:
        """
        Find an alternative route avoiding blocked stations or zones.
        Used when Safety Agent flags a section as dangerous.
        """
        source = source.upper()
        destination = destination.upper()
        blocked_stations = [s.upper() for s in (blocked_stations or [])]
        blocked_zones = [z.upper() for z in (blocked_zones or [])]

        # Create a copy of the graph with blocked nodes/edges removed
        temp_graph = self.graph.copy()

        # Remove blocked stations
        for station in blocked_stations:
            if station in temp_graph and station != source and station != destination:
                temp_graph.remove_node(station)

        # Remove edges in blocked zones
        if blocked_zones:
            edges_to_remove = []
            for u, v, data in temp_graph.edges(data=True):
                if data.get("zone", "").upper() in blocked_zones:
                    edges_to_remove.append((u, v))
            temp_graph.remove_edges_from(edges_to_remove)

        try:
            # Find shortest path in modified graph
            path = nx.shortest_path(temp_graph, source, destination, weight="distance")
            total_distance = nx.shortest_path_length(temp_graph, source, destination, weight="distance")

            # Also get the original shortest route for comparison
            original = self.find_route(source, destination)
            original_distance = original.get("total_distance_km", 0)

            # Build segments
            segments = []
            for i in range(len(path) - 1):
                edge = temp_graph[path[i]][path[i+1]]
                segments.append({
                    "from": path[i],
                    "from_name": self.stations.get(path[i], {}).get("name", path[i]),
                    "to": path[i+1],
                    "to_name": self.stations.get(path[i+1], {}).get("name", path[i+1]),
                    "distance_km": edge.get("distance", 0),
                    "zone": edge.get("zone", "")
                })

            extra_distance = int(total_distance) - original_distance
            extra_pct = round((extra_distance / max(original_distance, 1)) * 100, 1)

            return {
                "source": {"code": source, "name": self.stations.get(source, {}).get("name", source)},
                "destination": {"code": destination, "name": self.stations.get(destination, {}).get("name", destination)},
                "total_distance_km": int(total_distance),
                "original_distance_km": original_distance,
                "extra_distance_km": extra_distance,
                "extra_percentage": f"+{extra_pct}%",
                "num_stops": len(path),
                "path": path,
                "path_names": [self.stations.get(p, {}).get("name", p) for p in path],
                "blocked_stations": blocked_stations,
                "blocked_zones": blocked_zones,
                "segments": segments,
                "route_type": "alternative",
                "status": "Route found avoiding danger zones"
            }

        except nx.NetworkXNoPath:
            return {
                "error": "No alternative route available",
                "blocked_stations": blocked_stations,
                "blocked_zones": blocked_zones,
                "suggestion": "Consider delaying departure until danger zone clears"
            }

    def find_multiple_routes(self, source: str, destination: str, k: int = 3) -> list:
        """Find up to k different routes between two stations."""
        source = source.upper()
        destination = destination.upper()
        routes = []

        try:
            # Get k shortest paths
            paths = list(nx.shortest_simple_paths(
                self.graph, source, destination, weight="distance"
            ))

            for i, path in enumerate(paths[:k]):
                total_dist = sum(
                    self.graph[path[j]][path[j+1]].get("distance", 0)
                    for j in range(len(path) - 1)
                )
                routes.append({
                    "route_number": i + 1,
                    "path": path,
                    "path_names": [self.stations.get(p, {}).get("name", p) for p in path],
                    "total_distance_km": int(total_dist),
                    "num_stops": len(path)
                })

        except Exception as e:
            routes.append({"error": str(e)})

        return routes

    def get_network_stats(self) -> dict:
        """Return network statistics for the dashboard."""
        return {
            "total_stations": len(self.stations),
            "total_routes": len(self.trains),
            "graph_nodes": self.graph.number_of_nodes(),
            "graph_edges": self.graph.number_of_edges(),
            "is_connected": nx.is_connected(self.graph) if self.graph.number_of_nodes() > 0 else False,
            "num_components": nx.number_connected_components(self.graph),
            "avg_connections_per_station": round(
                sum(dict(self.graph.degree()).values()) / max(self.graph.number_of_nodes(), 1), 1
            )
        }

    def get_trains_between(self, source: str, destination: str) -> list:
        """Find all direct trains between two stations."""
        source = source.upper()
        destination = destination.upper()

        if self.graph.has_edge(source, destination):
            edge = self.graph[source][destination]
            return edge.get("trains", [])
        return []


# ============================================================
# SELF TEST
# ============================================================
if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 60)
    print("  ROUTING AGENT — SELF TEST")
    print("=" * 60)

    agent = RoutingAgent()

    # Network stats
    print("\n--- Network Statistics ---")
    stats = agent.get_network_stats()
    for k, v in stats.items():
        print(f"  {k}: {v}")

    # Search stations
    print("\n--- Station Search: 'DELHI' ---")
    results = agent.search_station("DELHI")
    for r in results[:5]:
        print(f"  {r['code']} — {r['name']} ({r['zone']})")

    # Find route: Delhi to Mumbai
    print("\n--- Route: NDLS (New Delhi) → BCT (Mumbai Central) ---")
    route = agent.find_route("NDLS", "BCT")
    if "error" not in route:
        print(f"  Distance: {route['total_distance_km']} km")
        print(f"  Stops: {route['num_stops']}")
        print(f"  Path: {' → '.join(route['path_names'][:10])}...")
    else:
        print(f"  {route['error']}")
        # Try alternative station codes
        print("\n  Trying JAT → BCT...")
        route = agent.find_route("JAT", "BCT")
        if "error" not in route:
            print(f"  Distance: {route['total_distance_km']} km")
            print(f"  Stops: {route['num_stops']}")
            path_display = ' → '.join(route['path_names'][:8])
            print(f"  Path: {path_display}...")
        else:
            print(f"  {route['error']}")

    # Try common routes
    print("\n--- Testing Common Routes ---")
    test_routes = [
        ("JAT", "UHP"),    # Jammu → Udhampur (should exist from data)
        ("HWH", "BBS"),    # Howrah → Bhubaneswar
        ("MAS", "SBC"),    # Chennai → Bangalore
    ]

    for src, dst in test_routes:
        route = agent.find_route(src, dst)
        if "error" not in route:
            print(f"  {src} → {dst}: {route['total_distance_km']}km, {route['num_stops']} stops")
            if route['num_stops'] <= 5:
                print(f"    Path: {' → '.join(route['path_names'])}")
        else:
            print(f"  {src} → {dst}: {route['error']}")

    # Test alternative routing (block a station)
    print("\n--- Alternative Route (blocking a station) ---")
    # Find two connected stations first
    sample_edges = list(agent.graph.edges())[:1]
    if sample_edges:
        src, dst = sample_edges[0]
        # Find a neighbor to test blocking
        neighbors = list(agent.graph.neighbors(src))
        if len(neighbors) > 1:
            blocked = neighbors[0]
            alt = agent.find_alternative(src, dst, blocked_stations=[blocked])
            if "error" not in alt:
                print(f"  {src} → {dst} (blocking {blocked}):")
                print(f"    Alternative distance: {alt['total_distance_km']}km")
                print(f"    Original distance: {alt['original_distance_km']}km")
                print(f"    Extra: {alt['extra_percentage']}")
            else:
                print(f"  {alt.get('error', 'No alternative found')}")

    print("\n✅ RoutingAgent self-test complete!")
