using DigitalMenuSystem.API.Models;
using Xunit;

namespace DigitalMenuSystem.Tests.Models
{
    public class TableTests
    {
        [Fact]
        public void Table_ShouldInitializeWithDefaultValues()
        {
            // Arrange & Act
            var table = new Table();

            // Assert
            Assert.Equal(0, table.Id);
            Assert.Equal(string.Empty, table.TableNumber);
            Assert.Equal(string.Empty, table.TableCode);
            Assert.Equal(0, table.Capacity);
            Assert.Null(table.Location);
            Assert.True(table.IsActive);
            Assert.NotNull(table.Orders);
            Assert.Empty(table.Orders);
        }

        [Fact]
        public void Table_ShouldSetPropertiesCorrectly()
        {
            // Arrange
            var table = new Table
            {
                Id = 1,
                RestaurantId = 100,
                TableNumber = "T1",
                TableCode = "TBL-ABC123",
                Capacity = 4,
                Location = "Window Side",
                IsActive = true
            };

            // Assert
            Assert.Equal(1, table.Id);
            Assert.Equal(100, table.RestaurantId);
            Assert.Equal("T1", table.TableNumber);
            Assert.Equal("TBL-ABC123", table.TableCode);
            Assert.Equal(4, table.Capacity);
            Assert.Equal("Window Side", table.Location);
            Assert.True(table.IsActive);
        }

        [Fact]
        public void Table_IsActive_ShouldDefaultToTrue()
        {
            // Arrange & Act
            var table = new Table();

            // Assert
            Assert.True(table.IsActive);
        }

        [Theory]
        [InlineData("T1", 2, "Patio")]
        [InlineData("T5", 4, "Main Hall")]
        [InlineData("A10", 6, "Private Room")]
        public void Table_ShouldAcceptVariousTableConfigurations(
            string tableNumber,
            int capacity,
            string location)
        {
            // Arrange
            var table = new Table
            {
                TableNumber = tableNumber,
                Capacity = capacity,
                Location = location
            };

            // Assert
            Assert.Equal(tableNumber, table.TableNumber);
            Assert.Equal(capacity, table.Capacity);
            Assert.Equal(location, table.Location);
        }

        [Fact]
        public void Table_CanBeDeactivated()
        {
            // Arrange
            var table = new Table
            {
                TableNumber = "T1",
                IsActive = true
            };

            // Act
            table.IsActive = false;

            // Assert
            Assert.False(table.IsActive);
        }

        [Fact]
        public void Table_CreatedAt_ShouldBeSetToUtcNow()
        {
            // Arrange
            var beforeCreation = DateTime.UtcNow;

            // Act
            var table = new Table();
            var afterCreation = DateTime.UtcNow;

            // Assert
            Assert.InRange(table.CreatedAt, beforeCreation.AddSeconds(-1), afterCreation.AddSeconds(1));
        }

        [Fact]
        public void Table_Orders_ShouldBeEmptyCollectionByDefault()
        {
            // Arrange & Act
            var table = new Table();

            // Assert
            Assert.NotNull(table.Orders);
            Assert.Empty(table.Orders);
            Assert.IsAssignableFrom<ICollection<Order>>(table.Orders);
        }
    }
}
