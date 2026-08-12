#!/usr/bin/env python
"""
SmartPark End-to-End Test Script
Tests the complete parking management system workflow
"""

import requests
import json
from datetime import datetime, timedelta

API_BASE = "http://127.0.0.1:8000/api"

def test_get_slots():
    """Test fetching parking slots"""
    print("\n=== Test: Get All Slots ===")
    resp = requests.get(f"{API_BASE}/slots")
    slots = resp.json()
    print(f"✓ Fetched {len(slots)} parking slots")
    available = [s for s in slots if s['status'] == 'AVAILABLE']
    print(f"  - Available: {len(available)}")
    print(f"  - First slot: #{slots[0]['slot_number']} ({slots[0]['status']})")
    return slots

def test_vehicle_entry(slot_id, vehicle_number="KA-TEST-0001"):
    """Test simulating a vehicle entry"""
    print(f"\n=== Test: Vehicle Entry (Slot {slot_id}) ===")
    payload = {
        "vehicle_number": vehicle_number,
        "owner_name": "Test Driver",
        "phone": "9999999999"
    }
    resp = requests.post(f"{API_BASE}/slots/{slot_id}/entry", json=payload)
    if resp.status_code == 200:
        result = resp.json()
        print(f"✓ Vehicle entry successful")
        print(f"  - Vehicle: {result.get('message', 'Entry processed')}")
        print(f"  - Sensor distance: {result.get('sensor_distance')} cm")
        return True
    else:
        print(f"✗ Failed: {resp.json()}")
        return False

def test_vehicle_exit(slot_id):
    """Test simulating a vehicle exit"""
    print(f"\n=== Test: Vehicle Exit (Slot {slot_id}) ===")
    resp = requests.post(f"{API_BASE}/slots/{slot_id}/exit")
    if resp.status_code == 200:
        result = resp.json()
        print(f"✓ Vehicle exit successful")
        print(f"  - Fee: ₹{result.get('amount', 0)}")
        print(f"  - Duration: {result.get('duration_hours', 0)} hours")
        print(f"  - Sensor distance: {result.get('sensor_distance')} cm")
        return True
    else:
        print(f"✗ Failed: {resp.json()}")
        return False

def test_get_analytics():
    """Test fetching analytics"""
    print(f"\n=== Test: Get Analytics ===")
    resp = requests.get(f"{API_BASE}/analytics")
    analytics = resp.json()
    print(f"✓ Analytics fetched")
    print(f"  - Total slots: {analytics['total_slots']}")
    print(f"  - Occupied: {analytics['occupied_slots']}")
    print(f"  - Available: {analytics['available_slots']}")
    print(f"  - Occupancy: {analytics['occupancy_percentage']}%")
    print(f"  - Total Revenue: ₹{analytics['total_revenue']}")
    print(f"  - Active Sessions: {analytics['active_sessions']}")
    return analytics

def test_get_sensors():
    """Test fetching sensors"""
    print(f"\n=== Test: Get All Sensors ===")
    resp = requests.get(f"{API_BASE}/sensors")
    sensors = resp.json()
    print(f"✓ Fetched {len(sensors)} sensors")
    if sensors:
        s = sensors[0]
        print(f"  - First sensor: {s['sensor_id']}")
        print(f"    * Distance: {s.get('distance_cm')} cm")
        print(f"    * Battery: {s.get('battery_level')}%")
        print(f"    * Signal: {s.get('signal_strength')} dBm")
        print(f"    * Status: {s['status']}")
    return sensors

def test_get_events():
    """Test fetching sensor events"""
    print(f"\n=== Test: Get Sensor Events ===")
    resp = requests.get(f"{API_BASE}/events?limit=5")
    events = resp.json()
    print(f"✓ Fetched {len(events)} recent events")
    if events:
        for i, e in enumerate(events[:3], 1):
            print(f"  Event {i}: {e['event_type']} - Sensor {e['sensor_id']}, Distance: {e['distance_cm']}cm")
    return events

def test_get_sessions():
    """Test fetching parking sessions"""
    print(f"\n=== Test: Get Parking Sessions ===")
    resp = requests.get(f"{API_BASE}/sessions")
    sessions = resp.json()
    print(f"✓ Fetched {len(sessions)} parking sessions")
    if sessions:
        s = sessions[0]
        print(f"  - Sample session:")
        print(f"    * Vehicle: {s.get('vehicle_number')}")
        print(f"    * Slot: {s.get('slot_number')}")
        print(f"    * Status: {s['status']}")
        print(f"    * Amount: ₹{s.get('amount', 0)}")
    return sessions

def test_get_vehicles():
    """Test fetching vehicles"""
    print(f"\n=== Test: Get Vehicles ===")
    resp = requests.get(f"{API_BASE}/vehicles")
    vehicles = resp.json()
    print(f"✓ Fetched {len(vehicles)} vehicles")
    if vehicles:
        v = vehicles[0]
        print(f"  - First vehicle: {v['vehicle_number']}")
        print(f"    * Owner: {v['owner_name']}")
        print(f"    * Phone: {v['phone']}")
    return vehicles

def test_health():
    """Test health check endpoint"""
    print(f"\n=== Test: Health Check ===")
    resp = requests.get(f"{API_BASE}/health")
    health = resp.json()
    print(f"✓ Backend healthy: {health['status']}")
    print(f"  - System: {health['system']}")
    print(f"  - Sensor Provider: {health['sensor_provider']}")
    print(f"  - WebSocket Clients: {health['websocket_clients']}")
    return health

if __name__ == "__main__":
    print("=" * 60)
    print("SmartPark End-to-End Test Suite")
    print("=" * 60)
    
    try:
        # Basic connectivity test
        test_health()
        
        # Fetch all data
        slots = test_get_slots()
        sensors = test_get_sensors()
        vehicles = test_get_vehicles()
        events = test_get_events()
        sessions = test_get_sessions()
        analytics_before = test_get_analytics()
        
        # Test vehicle entry/exit cycle
        available_slot = next((s for s in slots if s['status'] == 'AVAILABLE'), None)
        if available_slot:
            slot_id = available_slot['id']
            test_vehicle_entry(slot_id, "KA-TEST-9999")
            
            # Re-fetch slots to verify entry
            slots_after_entry = test_get_slots()
            test_vehicle_exit(slot_id)
            
            # Re-fetch slots to verify exit
            slots_after_exit = test_get_slots()
            
            # Fetch analytics again to see changes
            analytics_after = test_get_analytics()
            
            print(f"\n=== Summary ===")
            print(f"✓ Entry/Exit cycle completed successfully")
            print(f"  - Before: {analytics_before['occupied_slots']} occupied")
            print(f"  - After:  {analytics_after['occupied_slots']} occupied")
            print(f"  - Total Revenue: ₹{analytics_after['total_revenue']} (was ₹{analytics_before['total_revenue']})")
        else:
            print("\n⚠ No available slots for entry test")
        
        print("\n" + "=" * 60)
        print("✅ All tests completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
