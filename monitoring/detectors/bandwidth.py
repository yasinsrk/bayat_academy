from config import BANDWIDTH_SPIKE_MBPS

def detect_bandwidth_spike(net_data):
    alerts = []
    for iface, rate in net_data.get("interface_rates", {}).items():
        if rate["rx_mbps"] > BANDWIDTH_SPIKE_MBPS:
            alerts.append({"alert": "bandwidth_spike", "interface": iface, "direction": "rx", "value_mbps": rate["rx_mbps"]})
        if rate["tx_mbps"] > BANDWIDTH_SPIKE_MBPS:
            alerts.append({"alert": "bandwidth_spike", "interface": iface, "direction": "tx", "value_mbps": rate["tx_mbps"]})
    return alerts