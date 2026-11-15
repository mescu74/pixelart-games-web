"""Regenerate the local Natural Earth island outlines; runtime remains offline."""
import json,math,pathlib,urllib.request,sys
url='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
raw=json.load(open(sys.argv[1])) if len(sys.argv)>1 else json.load(urllib.request.urlopen(url))
f=next(f for f in raw['features'] if f['properties'].get('ADM0_A3')=='FLK')
rings=[p[0] for p in f['geometry']['coordinates']]
pts=[p for r in rings for p in r]
mnx=min(p[0] for p in pts);mxx=max(p[0] for p in pts);mny=min(p[1] for p in pts);mxy=max(p[1] for p in pts)
xscale=math.cos(math.radians((mny+mxy)/2));width=(mxx-mnx)*xscale
v={'source':'Natural Earth 1:50m admin 0 countries, public domain','projection':'local equirectangular at mid-latitude','bounds':[mnx,mny,mxx,mxy],'rings':[[[round((p[0]-mnx)*xscale/width*1000,1),round((mxy-p[1])/width*1000,1)] for p in r] for r in rings]}
pathlib.Path(__file__).with_name('map-data.js').write_text('window.AlasMap='+json.dumps(v,separators=(',',':'))+';\n')
print(len(rings),'islands,',len(pts),'points')
