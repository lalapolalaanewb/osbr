import { ObjectId } from "mongodb";
import { cartSessionService } from "../src/services/session";
import type { CartType } from "../src/types/cart";
import { createCart } from "../src/usecases/cart";
import { reset } from "./reset";

async function seed() {
  await reset();

  const newCart: Omit<CartType, "_id"> = {
    created_at: new Date(),
    created_by: "system",
    customer: {
      email: "dummy1@gmail.com",
      name: {
        first: "John",
        last: "Doe",
      },
      phoneDetails: {
        phoneNo: "149876475",
        phoneNoCountry: "MY",
      },
    },
    delivery_charge: 0,
    items: [
      {
        kind: "default",
        categories: [],
        created_at: new Date(),
        created_by: "system",
        description: "",
        name: "Item One",
        options: ["opt1", "opt2"],
        price: 75,
        product_id: new ObjectId().toString(),
        quantity: 1,
        sku: "PRODUCT-ID-1-ITEM-ONE",
        slug: "product-id-1-item-one",
        status: "active",
        tags: [],
        type: "item",
      },
    ],
    remarks: "",
    status: "active",
    sub_total: 75,
    total: 75,
  };
  const createCartData = await createCart(newCart);
  if (!createCartData.success || !createCartData.data) {
    console.log("Failed to create seed data!");
  }

  const cartId = createCartData.data as string;
  await cartSessionService.createSession(cartId, {
    cartId,
  });

  console.log("✅ Seed completed");
  console.log("Session ID:", process.env.SESSION_PREFIX_CART + cartId);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
