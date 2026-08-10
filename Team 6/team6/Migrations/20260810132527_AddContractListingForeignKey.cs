using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace team6.Migrations
{
    /// <inheritdoc />
    public partial class AddContractListingForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ListingId",
                table: "Contracts",
                column: "ListingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Listings_ListingId",
                table: "Contracts",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "ListingId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Listings_ListingId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ListingId",
                table: "Contracts");
        }
    }
}
