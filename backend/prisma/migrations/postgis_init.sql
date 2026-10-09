-- PostGIS Extension Initialization & Spatial Indexing

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Trigger to keep latitude and longitude synchronized with geometry Point(4326)
CREATE OR REPLACE FUNCTION sync_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
  -- If latitude and longitude are updated, update the locationPoint geometry
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.locationPoint := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_location_geometry ON locations;
CREATE TRIGGER trigger_sync_location_geometry
BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
FOR EACH ROW
EXECUTE FUNCTION sync_location_geometry();

-- Spatial GIST indexes for fast geographical queries
CREATE INDEX IF NOT EXISTS idx_locations_location_point ON locations USING GIST (locationPoint);
CREATE INDEX IF NOT EXISTS idx_locations_boundary_polygon ON locations USING GIST (boundaryPolygon);
