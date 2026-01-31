import { getRedisClient } from "../src/services/redis";
import { deleteCarts } from "../src/usecases/cart";
import { deleteOrders } from "../src/usecases/order";

export async function reset() {
  const deleteCartsData = await deleteCarts();
  if (!deleteCartsData.success) console.log(deleteCartsData.message);

  const deleteOrdersData = await deleteOrders();
  if (!deleteOrdersData.success) console.log(deleteOrdersData.message);

  const redis = await getRedisClient();
  await redis.flushAll("ASYNC");

  console.log(
    "✅ Successfully reset all. Please run 'docker compose exec app yarn run seed' to test again.",
  );
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
