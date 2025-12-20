from app import create_app

app = create_app()

print("🔍 CHECKING ALL REGISTERED ROUTES")
print("=" * 80)

# Group routes by prefix
routes_by_prefix = {}
for rule in app.url_map.iter_rules():
    route = rule.rule
    methods = ', '.join(sorted([m for m in rule.methods if m not in ['HEAD', 'OPTIONS']]))
    
    # Extract prefix
    parts = route.strip('/').split('/')
    prefix = parts[0] if parts else ''
    
    if prefix not in routes_by_prefix:
        routes_by_prefix[prefix] = []
    routes_by_prefix[prefix].append((methods, route, rule.endpoint))

# Print organized by prefix
for prefix in sorted(routes_by_prefix.keys()):
    print(f"\n📁 /{prefix}/ routes:" if prefix else "\n📁 Root routes:")
    for methods, route, endpoint in sorted(routes_by_prefix[prefix]):
        print(f"  {methods:<15} {route:<40} → {endpoint}")

# Also show all routes flat
print("\n" + "=" * 80)
print("📋 ALL ROUTES FLAT LIST:")
for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
    methods = ', '.join(sorted([m for m in rule.methods if m not in ['HEAD', 'OPTIONS']]))
    print(f"{methods:<15} {rule.rule}")
