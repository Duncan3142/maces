SELECT event.*, media.media_array
FROM event
LEFT JOIN (
   SELECT event_media.event_id AS event_id, array_agg(jsonb_build_object('type',media.type,'name',media.name,'description',media.description)) AS media_array
   FROM event_media
   JOIN media ON event_media.media_id = media.id
   GROUP BY event_media.event_id
   ) AS media ON (event.id = media.event_id)
WHERE event.end > NOW()
ORDER BY event.start

select * from media

select query from pg_stat_activity where (datname = 'maces') and (client_addr = '127.0.0.1')