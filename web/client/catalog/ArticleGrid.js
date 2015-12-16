import $ from 'jquery';

class ArticleGrid {
    constructor(numColumns, columnWidth, rowHeight, spacing) {
        this._columns = [];
        for (var i = 0; i < numColumns; ++i) {
            this._columns.push([]);
        }

        this._rowOffsets = [];

        this._columnWidth = columnWidth;
        this._rowHeight = rowHeight;
        this._spacing = spacing;

        this._shownDetails = null;
    }

    render() {
        this._element = $('<div class="article-grid" />').css({width: this.getTotalWidth()});
        this._element.parent().css({minWidth: this.getTotalWidth()});

        return this._element;
    }

    add(elementId, element, belowElementId, notAtElementIds, width, height) {
        width = width || 1;
        height = height || 1;

        // find a position for the new element
        var position = this.findPosition(belowElementId, notAtElementIds, width, height);

        // calculate css positions (pixels)
        var cssPosition = this.calcCssPosition(position);
        element.css(cssPosition);

        var newItem = {
            column: position.column,
            row: position.row,
            width: width,
            height: height,
            element: element,
            id: elementId
        };

        // first shift down any elements, that might be occupying this position
        this.shiftElementsDown(position.column, position.row, position.height, position.width);

        // then mark the occupied slots
        for (var i = position.column; i < position.column + position.width; ++i) {
            var column = this._columns[i];
            for (var j = 0; j < position.height; ++j) {
                column[position.row + j] = newItem;
            }
        }

        // now actually append the dom-element
        this._element.append(element);

        // and lastly calculate the new height of the container element
        var totalHeight = this.getTotalHeight();
        this._element.height(totalHeight);
        return elementId;
    }

    removeAndReplace(oldElementId, newElementId, newElement) {
        var oldItem = this.findItem(oldElementId);

        if (oldItem.width > 1 || oldItem.height > 1) {
            throw 'should not replace a multi-size item: ' + oldItem;
        }

        var newItem = {
            column: oldItem.column,
            row: oldItem.row,
            width: 1,
            height: 1,
            element: newElement,
            id: newElementId
        };

        this._columns[oldItem.column][oldItem.row] = newItem;
        this.reposition(newItem);

        oldItem.element.replaceWith(newElement);
        return newElementId;
    }

    showDetails(detailsElement, belowElementId) {
        if (this._shownDetails) {
            if (this._shownDetails.id === belowElementId) {
                return;
            }

            this.hideDetails();
        }

        var item = this.findItem(belowElementId);
        var row = item.row;

        // switch multi-size elements down, because they can not be split in half
        this._columns.forEach((column, columnIndex) => column.slice(row, row + 1)
                                  .filter(item => (item.height > 1 || item.width > 1) &&
                                          item.column === columnIndex &&
                                          (item.row + item.height) > (row + 1))
                                  .forEach(item => this.switchElementDown(item, row - item.row + 1)));

        var newOffset = {row: row + 1, height: this._rowHeight + this._spacing};
        this._rowOffsets.push(newOffset);

        this._columns.forEach((column) => column.slice(row + 1).forEach((item) => this.reposition(item)));

        this._shownDetails = {
            id: belowElementId,
            element: detailsElement,
            offset: newOffset,
            row: row
        };

        detailsElement.css(this.calcDetailsCss(this._shownDetails));
        this._element.append(detailsElement);

        // now scroll to the newly opened details (if neccesary)
        var windowHeight = $(window).height();
        var parentOffset = item.element.parent().offset();
        var cssTop = this.calcCssPosition(item).top;
        var cssBottom = cssTop + this._rowHeight * 2 + this._spacing;

        var minScroll = parentOffset.top + cssBottom + 20 - windowHeight;
        var maxScroll = Math.max(parentOffset.top + cssTop - 20, minScroll);

        var currentScroll = $('body').scrollTop();

        if (currentScroll < minScroll) {
            $('body').animate({scrollTop: minScroll}, 500);
        } else if (currentScroll > maxScroll) {
            $('body').animate({scrollTop: maxScroll}, 500);
        }
    }

    hideDetails() {
        if (this._shownDetails) {
            var row = this._shownDetails.offset.row;

            var element = this._shownDetails.element;
            if (element.data().onDestroy) {
                element.data().onDestroy();
            }

            element.addClass('leave');
            window.setTimeout(() => element.remove(), 1000);

            this._rowOffsets = this._rowOffsets.filter(offset => this._shownDetails.offset !== offset);
            this._shownDetails = null;

            this._columns.forEach((column) => column.slice(row).forEach((item) => this.reposition(item)));
        }
    }

    shiftElementsDown(columnIndex, row, by, width) {
        width = width || 1;

        for (var i = columnIndex; i < columnIndex + width; ++i) {
            var column = this._columns[i];

            for (var j = column.length - 1; j >= row; --j) {
                var item = column[j];

                if (! item) {
                    // nothing to shift
                    continue;
                }

                if (item.row !== j) {
                    // multi-height, will only be shifted once when the "root" is found
                    continue;
                }

                if (item.width > 1) {
                    // no shifting of multi-width elements, will skip smaller elements "over it"
                    continue;
                }

                var multiWidthOffset = 0;
                var targetItem = column[j + by + multiWidthOffset];
                while (targetItem && targetItem.width > 1) {
                    // we have to skip over this multi-width element
                    multiWidthOffset += targetItem.height;
                    targetItem = column[j + by + multiWidthOffset];
                }

                item.row += by + multiWidthOffset;

                var cssPosition = this.calcCssPosition(item);
                item.element.css(cssPosition);

                for (var k = j; k < j + item.height; ++k) {
                    column[k + by + multiWidthOffset] = item;
                }
            }
        }
    }

    switchElementDown(item, by) {
        console.log('switch down:', item);

        var multiSizeChecker = currentItem => currentItem !== item && (currentItem.width > 1 || currentItem.height > 1);

        // first lets check, wether there is another multi-size item, that needs to be switched down as well
        var switchDown = this._columns.slice(item.column, item.column + item.width) // relevant columns
                                      .reduce((currentValue, currentColumn) =>
                                           {
                                               currentColumn.slice(item.row + by, item.row + by + item.height)
                                                            .filter(multiSizeChecker)
                                                            .forEach(currentItem =>
                                                                currentValue[currentItem.id] = currentItem);
                                               return currentValue;
                                           },
                                           {});

        Object.keys(switchDown).map(key => switchDown[key])
                               .forEach(currentItem => this.switchElementDown(currentItem, by));

        // now move "below" items "above"
        for (var columnIndex = item.column; columnIndex < item.column + item.width; ++columnIndex) {
            var column = this._columns[columnIndex];

            for (var rowIndex = Math.max(item.row + item.height, item.row + by);
                 rowIndex < item.row + item.height + by;
                 ++rowIndex) {
                var targetItem = column[rowIndex];
                if (targetItem) {
                    if (targetItem.width > 1 || targetItem.height > 1) {
                        throw 'cant switch multi-size items up: ' + targetItem;
                    }

                    column[rowIndex].row = rowIndex - item.height;
                    column[rowIndex - item.height] = column[rowIndex];

                    this.reposition(targetItem);
                } else {
                    console.warn('hit an empty spot while trying to switch elements down:', columnIndex, rowIndex);
                    delete column[rowIndex - item.height];
                }

                column[rowIndex] = item;
            }
        }

        item.row += by;
    }

    findPosition(belowElementId, notAtElementIds, width, height, notInColumns) {
        notInColumns = notInColumns || [];

        if (notInColumns.length >= this._columns.length) {
            throw 'did not find a column for element:' + width + 'x' + height;
        }

        var result;

        if (belowElementId) {
            result = this.findInlinePosition(this.findElementRow(belowElementId),
                (notAtElementIds || []).concat([belowElementId]), width, height);
        } else {
            var columnIndex = this.findColumn(notInColumns);
            var row = this._columns[columnIndex].length;

            if (columnIndex + width > this._columns.length) {
                notInColumns.push(columnIndex);
                columnIndex = this._columns.length - width;
            }

            // we dont want to have cascading shifting, therefore no multi-width
            // elements my be in the requested spots
            if (width > 1) {
                for (var i = columnIndex; i < columnIndex + width; ++i) {
                    for (var j = row; j < row + height; ++j) {
                        if (this._columns[i][j] && this._columns[i][j].width > 1) {
                            notInColumns.push(i);
                            return this.findPosition(belowElementId, notAtElementIds, width, height, notInColumns);
                        }
                    }
                }
            }

            result = {
                column: columnIndex,
                row: row
            };
        }

        result.width = width;
        result.height = height;

        return result;
    }

    findItem(elementId) {
        var maxHeight = this._columns.reduce((height, column) => Math.max(height, column.length), 0);

        for (var i = 0; i < maxHeight; ++i) {
            var columns = this._columns.filter(
                    (column) => (column.length > i) && column[i] !== undefined && column[i].id === elementId);

            if (columns.length > 0) {
                return columns[0][i];
            }
        }

        throw 'element not found: ' + elementId;
    }

    findElementRow(elementId) {
        var item = this.findItem(elementId);
        return item.row;
    }

    findInlinePosition(row, notAtElementIds) {
        var columnIndex = Math.floor(Math.random() * this._columns.length);
        var column = this._columns[columnIndex];

        if (column.length <= row) {
            // should usually not happen, but lets act sane anyways!
            return {
                row: column.length,
                column: columnIndex
            };
        } else if (notAtElementIds.indexOf(column[row].id) > -1) {
            // we hit a spot that's covered by a "forbidden" element, let's try the next row
            return this.findInlinePosition(row + 1, notAtElementIds);
        } else if (column[row].width > 1) {
            // never at the position of a multi-width element
            return this.findInlinePosition(row + 1, notAtElementIds);
        } else {
            return {
                row: row,
                column: columnIndex
            };
        }
    }

    findColumn(notInColumns) {
        var minColumn = -1;
        var minHeight = Number.MAX_VALUE;

        for (var i = 0; i < this._columns.length; ++i) {
            if (notInColumns && notInColumns.indexOf(i) > -1) {
                continue;
            }

            if (this._columns[i].length < minHeight) {
                minColumn = i;
                minHeight = this._columns[minColumn].length;
            }
        }

        return minColumn;
    }

    getFilledHeight() {
        var columnIndex = this.findColumn();
        var columnHeight = this._columns[columnIndex].length;

        return this.calcCssPosition({column: columnIndex, row: columnHeight}).top;
    }

    getTotalHeight() {
        var offset = this._rowOffsets.reduce((currentOffset, rowOffset) => currentOffset + rowOffset.height, 0);

        var maxHeight = this._columns[0].length;

        for (var i = 1; i < this._columns.length; ++i) {
            if (this._columns[i].length > maxHeight) {
                maxHeight = this._columns[i].length;
            }
        }

        return (this._rowHeight + this._spacing) * maxHeight - this._spacing + offset;
    }

    getTotalWidth() {
        return (this._columnWidth + this._spacing) * this._columns.length - this._spacing;
    }

    reposition(item) {
        item.element.css(this.calcCssPosition(item));
    }

    calcCssPosition(position) {
        var offset = this._rowOffsets.filter(rowOffset => rowOffset.row <= position.row)
                                     .reduce((currentOffset, rowOffset) => currentOffset + rowOffset.height, 0);

        var result = {
            top: (this._rowHeight + this._spacing) * position.row + offset,
            left: (this._columnWidth + this._spacing) * position.column
        };

        if (position.width) {
            result.width = (this._columnWidth + this._spacing) * position.width - this._spacing;
        }
        if (position.height) {
            result.height = (this._rowHeight + this._spacing) * position.height - this._spacing;
        }

        return result;
    }

    calcDetailsCss(details) {
        var offset = this._rowOffsets.filter(rowOffset => rowOffset.row <= details.row)
                                     .reduce((currentOffset, rowOffset) => currentOffset + rowOffset.height, 0);

        var result = {
            top: (this._rowHeight + this._spacing) * (details.row + 1) + offset
        };

        return result;
    }
}

export default ArticleGrid;
