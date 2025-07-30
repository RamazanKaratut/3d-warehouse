import urllib.parse
from enum import Enum

class TravelMode(Enum):
    DRIVING = "driving"
    WALKING = "walking"
    BICYCLING = "bicycling"
    TRANSIT = "transit"

class Route:
    def __init__(self, summary: str, url: str):
        self.summary = summary
        self.url = url

class DirectionsSummary:
    def __init__(self, routes: list[Route]):
        self.routes = routes

# Fonksiyon adı düzeltildi
def Google_Maps(destination: str, origin: str = "My Location", travel_mode: TravelMode = TravelMode.DRIVING) -> DirectionsSummary:
    """
    Belirtilen hedef konuma yol tarifi bulur.

    Args:
        destination (str): Gidilecek konumun adresi veya adı.
        origin (str, optional): Başlangıç konumu. Varsayılan olarak "My Location" (Mevcut Konumum) kullanılır.
        travel_mode (TravelMode, optional): Seyahat modu (DRIVING, WALKING, BICYCLING, TRANSIT). Varsayılan DRIVING.

    Returns:
        DirectionsSummary: Yol tarifi özetini ve harita URL'ini içeren bir nesne.
    """
    base_url = "https://www.google.com/maps/dir/"
    encoded_origin = urllib.parse.quote_plus(origin)
    encoded_destination = urllib.parse.quote_plus(destination)
    mode = travel_mode.value

    map_url = f"{base_url}/dir/{encoded_origin}/{encoded_destination}/data=!4m2!4m1!3e{mode}"

    summary = f"{origin}'dan {destination}'a {travel_mode.name} ile yol tarifi."

    return DirectionsSummary(routes=[Route(summary=summary, url=map_url)])

# Bu fonksiyon adı da doğru
def navigate(destination: str) -> DirectionsSummary:
    """
    Belirtilen konuma doğrudan navigasyon başlatır.

    Args:
        destination (str): Gidilecek konumun adresi veya adı.

    Returns:
        DirectionsSummary: Navigasyon özetini ve harita URL'ini içeren bir nesne.
    """
    base_url = "https://www.google.com/maps/search/"
    encoded_destination = urllib.parse.quote_plus(destination)
    map_url = f"{base_url}/search/?api=1&query={encoded_destination}"

    summary = f"{destination} konumuna navigasyon."
    return DirectionsSummary(routes=[Route(summary=summary, url=map_url)])