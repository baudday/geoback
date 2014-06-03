<?php

require_once('./Sag/Sag.php');

$TEST = false;

if($TEST) {
  $sag = new Sag();
  $sag->login('admin', 'baseba77');
}

else {
  $sag = new Sag();
  $sag->login('admin', 'L3d7ePP3lIn');
}

print "Getting locations...\n";
$sag->setDatabase('locations');
$locations = $sag->getAllDocs(true)->body->rows;
print "Getting services...\n";
$sag->setDatabase('services');
$services = $sag->getAllDocs(true)->body->rows;

$completedCount = 0;
$totalCount = count($locations);

foreach ($locations as $location) {
  $location_id = $location->id;
  $filter = array_filter($services, function ($service) use ($location_id) {
    if(!isset($service->doc->loc_id)) return false;
    return $service->doc->loc_id === $location_id;
  });
  $location->doc->geoJSON->properties->serviceCount = count($filter);
  $sag->setDatabase('locations');
  $sag->put($location_id, $location->doc);
  $completedCount++;
  print "$completedCount out of $totalCount documents updated \r";
}

print "All done! :)\n";
