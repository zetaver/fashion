"use client";
import React, { useEffect, useState } from "react";
import { getNFTDetail, getNFTList } from "@/utils/nftMarket";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;  // Ensure that 'group' represents the collection
  mint: string;
  seller: string;
  price: string;
  listing: string;
  category?: string;  // Add category if relevant
}

const trimAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const Closet: React.FC = () => {
  const { publicKey } = useWallet();
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    collection: "",
    minPrice: 0,
    maxPrice: 1000,
    category: "",
  });

  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (wallet) fetchNFTs();
  }, [wallet]);

  const fetchNFTs = async () => {
    setIsLoading(true);
    const provider = new AnchorProvider(connection, wallet as Wallet, {});
    try {
      const listings = await getNFTList(provider, connection);
      const promises = listings
        .filter((list) => list.isActive)
        .map((list) => {
          const mint = new PublicKey(list.mint);
          return getNFTDetail(
            mint,
            connection,
            list.seller,
            list.price,
            list.pubkey
          );
        });
      const detailedListings = await Promise.all(promises);
      setAssets(detailedListings);
      setFilteredAssets(detailedListings);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = assets;
    if (filters.collection) {
      filtered = filtered.filter((asset) => asset.group === filters.collection);
    }
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter((asset) => {
        const price = parseFloat(asset.price) / 1000000;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });
    }
    if (filters.category) {
      filtered = filtered.filter((asset) => asset.category === filters.category);
    }
    setFilteredAssets(filtered);
  };

  return (
    <div className="p-4 pt-20 bg-white dark:bg-black min-h-screen flex">
      <div className="w-1/4 p-4 bg-gray-200 rounded-lg">
        {/* Filter Section */}
        <h2 className="text-xl font-semibold text-center mb-4">Filters</h2>
        <div className="mb-4">
          <label className="block text-sm">Collection</label>
          <input
            type="text"
            name="collection"
            value={filters.collection}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            placeholder="Search by collection"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Price Range(SOL)</label>
          <div className="flex justify-between">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
              placeholder="Min Price"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
              placeholder="Max Price"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="Photography">Photography</option>
          </select>
        </div>
        <button
          onClick={applyFilters}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Apply Filters
        </button>
      </div>

      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">
          NFTs on sale
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index}>
                <Skeleton className="h-64 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset: NFTDetail) => (
              <div
                key={asset.mint}
                className="relative p-4 border rounded shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-white dark:bg-black group"
              >
                <Link href={`/marketplace/${asset.mint}`}>
                  <div className="relative h-64 w-full mb-4">
                    {asset.image ? (
                      <Image
                        src={asset.image}
                        alt={`Asset ${asset.mint}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded"
                      />
                    ) : (
                      <p>No Image Available</p>
                    )}
                  </div>
                </Link>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-end items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
                  <p className="font-semibold">{asset.name || "Unknown"}</p>
                  <Link
                    href={`https://solana.fm/address/${asset.mint}`}
                    target="_blank"
                    className="hover:text-gray-300 flex items-center"
                  >
                    {trimAddress(asset.mint)}{" "}
                    <FaExternalLinkAlt className="ml-1" />
                  </Link>
                  {asset.group && (
                    <Link
                      href={`https://solana.fm/address/${asset.group}`}
                      target="_blank"
                      className="hover:text-gray-300 flex items-center"
                    >
                      Group: {trimAddress(asset.group)}{" "}
                      <FaExternalLinkAlt className="ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h2 className="text-2xl font-bold mb-4 text-center text-red-500 dark:text-yellow">
            No NFTs on sale
          </h2>
        )}
      </div>
    </div>
  );
};

export default Closet;
